require("dotenv").config();

const express = require("express");

const { Friendship, Users, ChatMessages, Sequelize } = require("../models");
const { authenticateToken } = require("../middleware/AuthMiddleware");

const router = express.Router();

router.get("/get-friend-requests", authenticateToken, async (req, res) => {
  // async function to add the according username and img to each request
  const getUser = async (requests) => {
    for (const request of requests) {
      const user = await Users.findByPk(request.fromUserId, {
        attributes: { exclude: ["password", "updatedAt"] },
        raw: true,
      });
      request.fromUser = user;
    }
    return requests;
  };

  // Gets all friend request for the logged in user
  Friendship.findAll({
    where: { toUserId: req.user.id, status: "PENDING" },
    raw: true,
  })
    .then(async (requests) => {
      const friendRequests = await getUser(requests);
      res.json({
        status: "SUCCESS",
        message: "All friend requests retrieved successfully",
        requests: friendRequests,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Failed to retrieve all friend requests",
      });
    });
});

router.get("/friends", authenticateToken, async (req, res) => {
  // async function to add the according friend user to the request
  const getUser = async (requests) => {
    for (const request of requests) {
      let id;
      if (req.user.id === request.fromUserId) {
        id = request.toUserId;
      }
      if (req.user.id === request.toUserId) {
        id = request.fromUserId;
      }
      const user = await Users.findByPk(id, {
        attributes: { exclude: ["password", "updatedAt"] },
        raw: true,
      });
      request.lastMessage = "";
      request.friend = user;
    }
    return requests;
  };

  const Op = Sequelize.Op;
  Friendship.findAll({
    where: {
      [Op.or]: [{ fromUserId: req.user.id }, { toUserId: req.user.id }],
      status: "FRIENDS",
    },
    raw: true,
  })
    .then(async (friends) => {
      const friendships = await getUser(friends);
      res.json({
        status: "SUCCESS",
        message: "All friends retrieved successfully",
        friends: friendships,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Failed to retrieve all friends",
      });
    });
});

router.put("/accept", authenticateToken, async (req, res) => {
  const { fromUser, toUserId, id } = req.body;

  Friendship.update({ status: "FRIENDS" }, { where: { id } })
    .then(() => {
      res.json({
        status: "SUCCESS",
        message: "friendship accepted succesfully",
        fromUser,
        toUserId,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "some error occurred while updating status",
      });
    });
});

router.delete("/delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log("id", id);

  Friendship.destroy({ where: { id, status: "FRIENDS" } })
    .then(() => {
      res.json({
        status: "SUCCESS",
        message: "friend deleted successfully",
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "some error occured while deleting friend",
      });
    });
});

router.delete("/reject/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  Friendship.destroy({ where: { id } })
    .then(() => {
      res.json({
        status: "SUCCESS",
        message: "friend request denied successfully",
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "some error occured while deleting the friend request",
      });
    });
});

router.get("/show-friend/:username", authenticateToken, async (req, res) => {
  const { username } = req.params;

  Users.findOne({
    where: { username },
    attributes: { exclude: ["password", "updatedAt"] },
  })
    .then((user) => {
      res.json({
        status: "SUCCESS",
        message: "friend profile found succesfully",
        friend: user,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "some error occured while deleting the friend request",
      });
    });
});

router.get("/chats", authenticateToken, async (req, res) => {
  const getUser = async (friendship) => {
    for (const friend of friendship) {
      let id;
      if (req.user.id === friend.fromUserId) {
        id = friend.toUserId;
      }
      if (req.user.id === friend.toUserId) {
        id = friend.fromUserId;
      }
      const user = await Users.findByPk(id, {
        attributes: { exclude: ["password", "updatedAt"] },
        raw: true,
      });
      const lastMessage = await ChatMessages.findAll({
        limit: 1,
        where: { friendshipId: friend.id },
        order: [["createdAt", "DESC"]],
      });

      friend.friend = user;
      friend.lastMessage = lastMessage;
    }
    return friendship;
  };

  const Op = Sequelize.Op;

  Friendship.findAll({
    where: {
      [Op.or]: [{ fromUserId: req.user.id }, { toUserId: req.user.id }],
      status: "FRIENDS",
      hasMessages: 1,
    },
    raw: true,
    order: [["createdAt", "DESC"]],
  })
    .then(async (friendship) => {
      if (friendship) {
        const chats = await getUser(friendship);

        res.json({
          status: "SUCCESS",
          message: "Friends with chats have been retreived successfully",
          chats,
        });
      } else {
        res.json({
          status: "SUCCESS",
          message: "User has no chats with friends",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "Failed to retrieve friends with chats",
      });
    });
});

module.exports = router;
