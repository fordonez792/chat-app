const { Server } = require("socket.io");
const {
  Users,
  Friendship,
  ChatMessages,
  GroupChats,
  GroupChatMembers,
  GroupChatMessages,
  Sequelize,
} = require("../models");

const getIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://fernando-chatx.netlify.app",
      methods: ["GET", "POST"],
    },
  });

  // Middleware that allows me to get the username and id for a user on connection
  io.use((socket, next) => {
    socket.username = socket.handshake.auth.username;
    socket.userId = socket.handshake.auth.userId;
    next();
  });
  io.on("connection", async (socket) => {
    console.log(`connected: ${socket.username}, id: ${socket.id}`);

    Users.findOne({ where: { username: socket.username } })
      .then((res) => {
        res.update({ socketID: socket.id });
        if (res.dataValues.status !== "OFFLINE") return;
        res.update({ status: "ONLINE" });
      })
      .catch((error) => console.log(error));

    GroupChatMembers.findAll({ where: { userId: socket.userId } }).then(
      (gcMembership) => {
        gcMembership.forEach(async (gc) => {
          const groupChat = await GroupChats.findOne({
            where: { id: gc.groupChatId },
          });
          socket.join(groupChat.socketRoom);
        });
      }
    );

    setTimeout(
      () =>
        GroupChats.findAll({ include: Users }).then((allGroupChats) => {
          allGroupChats.forEach((gc) => {
            if (socket.id === gc.User.socketID) {
              socket.join(gc.socketRoom);
            }
            if (socket.rooms.has(gc.socketRoom)) {
              console.log(`${socket.username} joined room ${gc.socketRoom}`);
            } else {
              console.log(
                `${socket.username} failed to join room ${gc.socketRoom}`
              );
            }
          });
        }),
      1000
    );

    socket.on("friend_request", async ({ to }) => {
      // Creates a pending friendship as the request has been sent but not accepted or declined
      Friendship.create({
        status: "PENDING",
        fromUserId: socket.userId,
        toUserId: to,
      })
        .then(() => {
          io.emit("receive_friend_request", { from: socket.userId, to });
        })
        .catch((error) => console.log(error));
    });

    // User will join a room once they click to chat with a friend
    socket.on("join_room", async ({ to, from }) => {
      Users.findOne({ where: { username: to } })
        .then(async (user) => {
          socket.to(user.socketID).emit("joined", { to, from });
          console.log(`${from} joined room with ${to}`);
        })
        .catch((error) => console.log(error));
    });

    // This will allow for both user and friend to be in sync when they are both inside the chat room
    socket.on("user_joined", async ({ to, from }) => {
      Users.findOne({ where: { username: from } }).then(async (user) => {
        socket.to(user.socketID).emit("also_joined");
      });
    });

    socket.on("seen", async ({ to, from }) => {
      const Op = Sequelize.Op;

      const toUser = await Users.findOne({
        where: { username: to },
        raw: true,
      });
      const fromUser = await Users.findOne({
        where: { username: from },
        raw: true,
      });

      const updateMessages = async (allMessages) => {
        for (const message of allMessages) {
          if (message.author === fromUser.username) return;
          message.update({ seen: 1 });
        }
        return allMessages;
      };

      Friendship.findOne({
        where: {
          [Op.and]: [
            { [Op.or]: [{ fromUserId: toUser.id }, { toUserId: toUser.id }] },
            {
              [Op.or]: [{ fromUserId: fromUser.id }, { toUserId: fromUser.id }],
            },
          ],
        },
        raw: true,
      })
        .then(async (friendship) => {
          const allMessages = await ChatMessages.findAll({
            where: { friendshipId: friendship.id, seen: 0 },
          });
          let seenMessages;
          if (allMessages.length > 0) {
            seenMessages = await updateMessages(allMessages);
          }
          console.log("hi");
          socket.to(toUser.socketID).emit("has_seen", { seenMessages });
        })
        .catch((error) => console.log(error));
    });

    socket.on("immediate_seen", async ({ id, from, to }) => {
      const fromUser = await Users.findOne({
        where: { username: from },
        raw: true,
      });

      ChatMessages.findOne({ where: { id } }).then(async (message) => {
        if (message == null) return;
        await message.update({ seen: 1 });
        console.log("hi", message);
        socket
          .to(fromUser.socketID)
          .emit("has_seen", { seenMessages: message });
      });
    });

    // Detects when a user is typing and lets the other person know
    socket.on("typing", ({ to }) => {
      Users.findOne({ where: { username: to } }).then((user) => {
        socket.to(user.socketID).emit("is_typing");
      });
    });

    socket.on("send_message", async ({ to, content }) => {
      const Op = Sequelize.Op;

      const toUser = await Users.findOne({ where: { username: to } });
      const fromUser = await Users.findOne({
        where: { username: content.author },
      });
      Friendship.findOne({
        where: {
          [Op.and]: [
            { [Op.or]: [{ fromUserId: toUser.id }, { toUserId: toUser.id }] },
            {
              [Op.or]: [{ fromUserId: fromUser.id }, { toUserId: fromUser.id }],
            },
          ],
        },
        raw: true,
      })
        .then(async (friendship) => {
          await Friendship.update(
            { hasMessages: 1 },
            { where: { id: friendship.id } }
          );
          const newMessage = await ChatMessages.create({
            author: content.author,
            message: content.message,
            seen: 0,
            friendshipId: friendship.id,
            groupChatId: null,
          });
          socket.to(toUser.socketID).emit("receive_message", {
            to,
            content,
          });
          socket.emit("message_sent", { newMessage });
          socket.to(toUser.socketID).emit("message_sent", { newMessage });
        })
        .catch((error) => console.log(error));
    });

    // User will leave a room once they click to go back to home page
    socket.on("leave_room", ({ to }) => {
      Users.findOne({ where: { username: to } }).then((user) => {
        socket.to(user.socketID).emit("left");
        console.log(`User left chat with ${to}`);
      });
    });

    // Group Chat Events

    socket.on("new_group_chat", async ({ newGroupChat }) => {
      const roomName = `${newGroupChat.name}-${newGroupChat.id}`;

      socket.join(roomName);

      const groupChat = await GroupChats.findOne({
        where: { id: newGroupChat.id },
      });
      groupChat.socketRoom = roomName;
      groupChat.save(["socketRoom"]);
    });

    socket.on("typing_gc", ({ to, id, username }) => {
      GroupChats.findOne({ where: { name: to, id } }).then((gc) => {
        socket
          .to(gc.socketRoom)
          .emit("is_typing_gc", { room: gc.socketRoom, username });
      });
    });

    socket.on("send_message_gc", async ({ to, id, content }) => {
      const groupChat = await GroupChats.findOne({ where: { id, name: to } });
      GroupChatMessages.create({
        message: content.message,
        authorId: content.author,
        groupChatId: groupChat.id,
      })
        .then(async (newMessage) => {
          groupChat.hasMessages = true;
          groupChat.save(["hasMessages"]);
          io.to(groupChat.socketRoom).emit("receive_message_gc", {
            id: newMessage.groupChatId,
            to,
            content,
          });
          io.to(groupChat.socketRoom).emit("message_sent_gc", {
            newMessage,
            groupChat,
            content,
          });
        })
        .catch((error) => {
          console.log(error);
          return;
        });
    });

    socket.on("seen_gc", async ({ name, id, userId }) => {
      GroupChatMessages.findAll({ where: { groupChatId: id } }).then(
        (messages) => {
          messages.filter((message) => {
            if (userId === message.authorId) return;
            if (message.seenByMembers) {
              const seenMembers = message.seenByMembers.split(",");
              if (!seenMembers.find((member) => parseInt(member) === userId)) {
                seenMembers.push(userId);
                message.seenByMembers = seenMembers.toString();
                message.save(["seenByMembers"]);
              }
            } else {
              message.seenByMembers = userId;
              message.save(["seenByMembers"]);
            }
          });
        }
      );
    });

    socket.on("immediate_seen_gc", async ({ userId, messageId }) => {
      GroupChatMessages.findOne({ where: { id: messageId } })
        .then((message) => {
          if (userId === message.authorId) return;
          if (message.seenByMembers) {
            const seenMembers = message.seenByMembers.split(",");
            if (!seenMembers.find((member) => parseInt(member) === userId)) {
              seenMembers.push(userId);
              message.seenByMembers = seenMembers.toString();
              message.save(["seenByMembers"]);
            }
          } else {
            message.seenByMembers = userId;
            message.save(["seenByMembers"]);
          }
        })
        .catch((error) => console.log(error));
    });

    // catches all events and logs them out on terminal
    socket.onAny((event, ...args) => {
      console.log(event, args);
    });

    socket.on("disconnect", () => {
      console.log(`disconnected: ${socket.username}`);

      Users.findOne({ where: { username: socket.username } })
        .then((res) => {
          if (res.dataValues.status !== "ONLINE") return;
          res.update({ status: "OFFLINE" });
        })
        .catch((error) => console.log(error));
    });
  });
};

module.exports = { getIO };
