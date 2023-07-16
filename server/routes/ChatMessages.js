require("dotenv").config();

const express = require("express");

const {
  Friendship,
  Users,
  ChatMessages,
  Sequelize,
  Groupchats,
} = require("../models");
const { authenticateToken } = require("../middleware/AuthMiddleware");

const router = express.Router();

router.get("/:username", authenticateToken, async (req, res) => {
  const Op = Sequelize.Op;
  const { username } = req.params;

  if (parseInt(username.split("-", 3)[2]) === 0) return;

  const toUser = await Users.findOne({ where: { username } });
  Friendship.findOne({
    where: {
      [Op.and]: [
        { [Op.or]: [{ fromUserId: toUser.id }, { toUserId: toUser.id }] },
        {
          [Op.or]: [{ fromUserId: req.user.id }, { toUserId: req.user.id }],
        },
      ],
    },
    raw: true,
  })
    .then((friendship) => {
      ChatMessages.findAll({ where: { friendshipId: friendship.id } })
        .then((messages) => {
          res.json({
            status: "SUCCESS",
            message: "Successfully retrieved messages",
            messages,
          });
        })
        .catch((error) => {
          console.log(error);
          res.json({
            status: "FAILED",
            message: "Failed to find messages",
          });
        });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Failed to find correct friendship",
      });
    });
});

module.exports = router;
