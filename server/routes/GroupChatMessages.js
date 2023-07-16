require("dotenv").config();

const express = require("express");

const {
  GroupChats,
  GroupChatMembers,
  GroupChatMessages,
  Users,
  Sequelize,
} = require("../models");
const { authenticateToken } = require("../middleware/AuthMiddleware");

const router = express.Router();

router.get("/get-messages/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  const appendUsername = async (messages) => {
    for (const message of messages) {
      const usernames = [];
      const author = await Users.findOne({ where: { id: message.authorId } });
      message.authorName = author.username;
      if (message.seenByMembers) {
        const seen = message.seenByMembers.split(",");
        for (const id of seen) {
          const user = await Users.findOne({ where: { id } });
          usernames.push(user.username);
        }
      }
      message.seenUsernames = usernames;
    }
    return messages;
  };

  const groupChat = await GroupChats.findOne({ where: { id } });
  GroupChatMessages.findAll({ where: { groupChatId: id }, raw: true })
    .then(async (messages) => {
      const updatedMessages = await appendUsername(messages);
      res.json({
        status: "SUCCESS",
        message: "All messages found successfully",
        messages: updatedMessages,
        groupChat,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Some error occured while looking for messages",
      });
      return;
    });
});

module.exports = router;
