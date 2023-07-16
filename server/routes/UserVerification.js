require("dotenv").config();

const express = require("express");
const { sign, verify } = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { Users } = require("../models");
const { authenticateToken } = require("../middleware/AuthMiddleware");
const { verifyEmail } = require("../services/Email");

const router = express.Router();

router.put("/", authenticateToken, async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findByPk(req.user.id);
  bcrypt.compare(password, user.password).then((match) => {
    if (!match) {
      res.json({
        status: "FAILED",
        message: "Wrong password entered",
      });
      return;
    }
    const emailToken = sign(
      { username: req.user.username, id: req.user.id },
      process.env.EMAIL_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    verifyEmail(req.user.id, email, emailToken);
    Users.update({ email }, { where: { username: req.user.username } })
      .then(async () => {
        const user = await Users.findByPk(req.user.id, {
          exclude: ["password", "updatedAt"],
        });
        res.json({ status: "SUCCESS", user });
      })
      .catch((error) => console.log(error));
  });
});

router.post("/verify-email-token", async (req, res) => {
  const { id, token } = req.body;

  console.log(id, token);

  const user = await Users.findByPk(id);
  try {
    verify(token, process.env.EMAIL_TOKEN_SECRET);
    Users.update({ verified: true }, { where: { username: user.username } })
      .then(() => {
        res.json({
          status: "SUCCESS",
          message: "Email verified successfully",
        });
        return;
      })
      .catch((error) => {
        console.log(error);
        res.json({
          status: "FAILED",
          message: "Error occurred while updating verified status",
        });
      });
  } catch (error) {
    console.log(error);
    res.json({
      status: "FAILED",
      message: "Verification of email token failed",
    });
    return;
  }
});

module.exports = router;
