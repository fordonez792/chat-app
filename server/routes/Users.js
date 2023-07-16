require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const {
  Users,
  ChatMessages,
  Friendship,
  GroupChatMessages,
  GroupChatMembers,
  GroupChats,
  Sequelize,
} = require("../models");
const { authenticateToken } = require("../middleware/AuthMiddleware");
const { sign } = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  // hashes password and uploads data to database
  try {
    bcrypt.hash(password, 10).then((hash) => {
      Users.create({
        username,
        password: hash,
        name: "",
        email: "",
        verified: false,
        city: "",
        country: "",
      });
      res.json("success");
    });
  } catch (error) {
    console.log(error);
    res.send();
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // check if user exists in database
  const user = await Users.findOne({ where: { username } });

  if (!user) return res.json({ error: "User does not exist!" });

  try {
    // check password to see if they  match
    bcrypt.compare(password, user.password).then(async (match) => {
      if (!match)
        return res.json({ error: "Username and password don't match" });
      const accessToken = sign(
        { username: user.username, id: user.id },
        process.env.ACCESS_TOKEN_SECRET
      );
      res.json({ accessToken, username, id: user.id });
    });
  } catch (error) {
    console.log(error);
    res.send();
  }
});

router.get("/auth", authenticateToken, (req, res) => {
  res.json(req.user);
});

router.get("/profile", authenticateToken, async (req, res) => {
  const id = req.user.id;
  const profileInfo = await Users.findByPk(id, {
    attributes: { exclude: ["password", "updatedAt"] },
  });
  res.json(profileInfo);
});

router.put("/update-info", authenticateToken, async (req, res) => {
  const id = req.user.id;
  const { category, newValue, password } = req.body;
  const user = await Users.findByPk(id);
  try {
    // check password to see if they  match
    bcrypt.compare(password, user.password).then(async (match) => {
      if (!match) {
        res.json({ error: "Wrong password entered" });
        return;
      }
      Users.update(
        // update the specific category with the new value
        { [category]: newValue },
        { where: { username: req.user.username } }
      ).then(async () => {
        // wait for update to be completed then retrieve updated info
        const updatedProfile = await Users.findByPk(id, {
          attributes: { exclude: ["password", "updatedAt"] },
        });
        res.json(updatedProfile);
      });
    });
  } catch (error) {
    console.log(error);
    res.send();
  }
});

router.put("/change-password", authenticateToken, async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  const user = await Users.findOne({ where: { username: req.user.username } });
  try {
    bcrypt.compare(oldPassword, user.password).then(async (match) => {
      if (!match) {
        res.json({ error: "Wrong password entered" });
        return;
      }
      bcrypt.hash(newPassword, 10).then((hash) => {
        Users.update(
          { password: hash },
          { where: { username: req.user.username } }
        );
        res.json("success");
      });
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get("/find/", authenticateToken, async (req, res) => {
  const { search } = req.query;
  if (!search || search === "") return;
  Users.findAll({
    where: { username: search },
    attributes: { exclude: ["password", "updatedAt"] },
  })
    .then((user) => {
      if (user.length < 1) {
        res.json({
          status: "FAILED",
          message: "Username does not exist",
        });
        return;
      }
      res.json({
        status: "SUCCESS",
        user,
        message: "User Found! Send a friend request.",
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Username does not exist",
      });
    });
});

router.put("/update-status", authenticateToken, async (req, res) => {
  const { newStatus } = req.body;
  Users.update(
    { status: newStatus },
    { where: { username: req.user.username } }
  )
    .then(() => {
      res.json({
        status: "SUCCESS",
        message: "status updated successfully",
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "failed to update status",
      });
    });
});

router.get("/notification", authenticateToken, async (req, res) => {
  const Op = Sequelize.Op;

  let friendshipNotification = false;
  let messageNotification = false;
  let gcMessageNotification = false;
  let message;
  let gcMessage;
  let groupChat;

  const friendships = await Friendship.findAll({
    where: { status: "PENDING" },
  });
  if (friendships && friendships.length > 0) {
    friendshipNotification = true;
  }
  const allFriendships = await Friendship.findAll({
    where: {
      [Op.or]: [{ fromUserId: req.user.id }, { toUserId: req.user.id }],
      status: "FRIENDS",
      hasMessages: 1,
    },
  });
  if (allFriendships) {
    for (const friendship of allFriendships) {
      message = await ChatMessages.findOne({
        where: { seen: 0, friendshipId: friendship.id },
        order: [["createdAt", "DESC"]],
      });
      if (message) {
        if (req.user.username === message.author) return;
        messageNotification = true;
        break;
      }
    }
  }
  const creator = await GroupChats.findAll({
    where: { creatorId: req.user.id, hasMessages: true },
  });
  const memberships = await GroupChatMembers.findAll({
    where: { userId: req.user.id },
  });
  if (memberships && memberships.length > 0) {
    for (const member of memberships) {
      const gcMessages = await GroupChatMessages.findAll({
        where: { groupChatId: member.groupChatId },
      });
      const chat = await GroupChats.findOne({
        where: { id: member.groupChatId },
      });
      gcMessages.filter((message) => {
        if (req.user.id === message.authorId) return;
        if (message.seenByMembers) {
          const seenMembers = message.seenByMembers.split(",");
          if (!seenMembers.find((member) => parseInt(member) === req.user.id)) {
            groupChat = chat;
            gcMessage = message;
            gcMessageNotification = true;
          }
        } else {
          groupChat = chat;
          gcMessage = message;
          gcMessageNotification = true;
        }
      });
    }
  }

  if (!gcMessageNotification && creator && creator.length > 0) {
    for (const chat of creator) {
      const gcMessages = await GroupChatMessages.findAll({
        where: { groupChatId: chat.id },
      });
      gcMessages.filter((message) => {
        if (req.user.id === message.authorId) return;
        if (message.seenByMembers) {
          const seenMembers = message.seenByMembers.split(",");
          if (!seenMembers.find((member) => parseInt(member) === req.user.id)) {
            groupChat = chat;
            gcMessage = message;
            gcMessageNotification = true;
          }
        } else {
          groupChat = chat;
          gcMessage = message;
          gcMessageNotification = true;
        }
      });
    }
  }
  res.json({
    status: "SUCCESS",
    message: "All notifications retrieved successfully",
    friendshipNotification,
    messageNotification,
    message,
    gcMessageNotification,
    gcMessage,
    groupChat,
  });
});

module.exports = router;
