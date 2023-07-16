require("dotenv").config();

const express = require("express");

const {
  Users,
  Friendship,
  GroupChats,
  GroupChatMembers,
  GroupChatMessages,
  Sequelize,
} = require("../models");
const { authenticateToken } = require("../middleware/AuthMiddleware");

const router = express.Router();

router.post("/create", authenticateToken, async (req, res) => {
  const { name, selectedFriendsId } = req.body;
  const groupMembers = selectedFriendsId.split(",");

  if (!name) {
    res.json({
      status: "FAILED",
      message: "No name was given",
    });
    return;
  }

  if (!selectedFriendsId || !groupMembers) {
    res.json({
      status: "FAILED",
      message: "No friends were given",
    });
    return;
  }

  const newGroupChat = await GroupChats.create({
    name,
    creatorId: req.user.id,
  });

  for (const id of groupMembers) {
    await GroupChatMembers.create({ userId: id, groupChatId: newGroupChat.id });
  }

  res.json({
    status: "SUCCESS",
    message: "everything created successfully",
    newGroupChat,
  });
});

router.get("/get-group-chats", authenticateToken, async (req, res) => {
  const Op = Sequelize.Op;

  const getLastMessage = async (chats) => {
    for (const chat of chats) {
      const lastMessage = await GroupChatMessages.findOne({
        where: { groupChatId: chat.id },
        order: [["createdAt", "DESC"]],
      });
      const authorName = await Users.findOne({
        where: { id: lastMessage.authorId },
      });
      if (!lastMessage) {
        chat.lastMessage = "No Messages";
      } else {
        chat.lastMessage = lastMessage;
        chat.authorName = authorName.username;
      }
    }
    return chats;
  };

  GroupChatMembers.findAll({ where: { userId: req.user.id }, raw: true })
    .then(async (chats) => {
      const allGroupChats = [];
      for (const i in chats) {
        const member = await GroupChats.findOne({
          where: {
            id: chats[i].groupChatId,
          },
          raw: true,
        });
        allGroupChats.push(member);
      }
      const admin = await GroupChats.findAll({
        where: { creatorId: req.user.id },
        raw: true,
      });
      for (const i in admin) {
        allGroupChats.push(admin[i]);
      }
      const updatedChats = await getLastMessage(allGroupChats);
      updatedChats.sort((a, b) => a.createdAt - b.createdAt);
      res.json({
        status: "SUCCESS",
        message: "All group chats found successfully",
        id: req.user.id,
        updatedChats,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Some error happened while looking as member",
      });
      return;
    });
});

router.get("/get-members/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const Op = Sequelize.Op;

  const gcMembers = [];

  const groupChat = await GroupChats.findOne({
    where: { id },
    include: [
      {
        model: Users,
        attributes: {
          exclude: ["password", "socketID", "createdAt", "updatedAt"],
        },
      },
    ],
  });

  if (groupChat.User.id !== req.user.id) {
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { fromUserId: req.user.id, toUserId: groupChat.User.id },
          { fromUserId: groupChat.User.id, toUserId: req.user.id },
        ],
        status: "FRIENDS",
      },
    });
    if (friendship) {
      groupChat.User.dataValues.friend = friendship;
    }
  }

  GroupChatMembers.findAll({
    where: { groupChatId: id },
    include: [
      {
        model: Users,
        attributes: {
          exclude: ["password", "socketID", "createdAt", "updatedAt"],
        },
      },
    ],
  })
    .then(async (members) => {
      for (const member of members) {
        const friendship = await Friendship.findOne({
          where: {
            [Op.or]: [
              { fromUserId: req.user.id, toUserId: member.User.id },
              { fromUserId: member.User.id, toUserId: req.user.id },
            ],
            status: "FRIENDS",
          },
        });
        if (friendship) {
          member.User.dataValues.friend = friendship;
        }
        gcMembers.push(member.User);
      }
      res.json({
        status: "SUCCESS",
        message: "All members retrieved successfully",
        gcMembers,
        creator: groupChat.User,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Some error occurred while retrieving the group chat members",
      });
    });
});

router.delete(
  "/remove-member/:id/:groupChatId",
  authenticateToken,
  async (req, res) => {
    const { id, groupChatId } = req.params;
    GroupChatMembers.destroy({ where: { groupChatId, userId: id } })
      .then(() => {
        res.json({
          status: "SUCCESS",
          message: "Member deleted successfully",
        });
      })
      .catch((error) => {
        console.log(error);
        res.json({
          status: "FAILED",
          message: "Some error occured while deleting a member",
        });
      });
  }
);

router.get("/get-missing-friends/:id", authenticateToken, async (req, res) => {
  const Op = Sequelize.Op;
  const { id } = req.params;
  const missingFriends = [];

  Friendship.findAll({
    where: {
      [Op.or]: [{ fromUserId: req.user.id }, { toUserId: req.user.id }],
      status: "FRIENDS",
    },
  })
    .then(async (friends) => {
      const members = await GroupChatMembers.findAll({
        where: { groupChatId: id },
      });
      if (friends.length > members.length) {
        for (const member of members) {
          const missingFriend = friends.find((friend) => {
            if (
              friend.toUserId !== member.userId &&
              friend.fromUserId !== member.userId
            ) {
              return friend;
            }
          });
          if (missingFriend) {
            const missingUser = await Users.findOne({
              where: {
                id:
                  req.user.id === missingFriend.toUserId
                    ? missingFriend.fromUserId
                    : missingFriend.toUserId,
              },
              attributes: {
                exclude: ["password", "socketID", "createdAt", "updatedAt"],
              },
            });
            missingFriends.push(missingUser);
          }
        }
      }
      if (missingFriends.length > 0) {
        res.json({
          status: "SUCCESS",
          message: "All missing friends from this group chat have been found",
          missingFriends,
        });
      } else {
        res.json({
          status: "FAILED",
          message: "All friends are already part of this group chat.",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Something happened while looking for missing friends",
      });
    });
});

router.post("/add-member", authenticateToken, async (req, res) => {
  const { selectedFriendsId, groupChatId } = req.body;
  const groupMembers = selectedFriendsId.split(",");
  const newMembers = [];

  if (!selectedFriendsId || !groupMembers) {
    res.json({
      status: "FAILED",
      message: "No friends were given",
    });
    return;
  }
  for (const id of groupMembers) {
    await GroupChatMembers.create({ userId: id, groupChatId });
    const newMember = await Users.findOne({
      where: { id },
      attributes: {
        exclude: ["password", "socketID", "createdAt", "updatedAt"],
      },
    });
    newMembers.push(newMember);
  }

  res.json({
    status: "SUCCESS",
    message: "Everything created successfully",
    newMembers,
  });
});

router.put("/change-name", authenticateToken, async (req, res) => {
  const { name, id } = req.body;
  GroupChats.findOne({ where: { id } })
    .then(async (groupChat) => {
      if (!groupChat) {
        res.json({
          status: "FAILED",
          message: "No group chat found",
        });
        return;
      }
      groupChat.name = name;
      groupChat.socketRoom = `${name}-${groupChat.id}`;
      await groupChat.save(["name", "socketRoom"]);
      res.json({
        status: "SUCCESS",
        message: "Name updated successfully",
        newName: name,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Something happened while trying to change the name",
      });
      return;
    });
});

router.delete("/delete-group-chat/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const groupChat = await GroupChats.findOne({ where: { id } });
  if (groupChat) {
    if (groupChat.creatorId !== req.user.id) {
      res.json({
        status: "FAILED",
        message: "You are not the creator, therefore can't delete",
      });
      return;
    }
    await groupChat.destroy();
    res.json({
      status: "SUCCESS",
      message: "Group Chat deleted successfully",
    });
  } else {
    res.json({
      status: "FAILED",
      message: "Group Chat was not found",
    });
  }
});

module.exports = router;
