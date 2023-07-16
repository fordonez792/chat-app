const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const db = require("./models");

// Routers
const usersRouter = require("./routes/Users");
app.use("/users", usersRouter);
const userVerificationRouter = require("./routes/UserVerification");
app.use("/user-verification", userVerificationRouter);
const friendshipRouter = require("./routes/Friendship");
app.use("/friendship", friendshipRouter);
const chatMessagesRouter = require("./routes/ChatMessages");
app.use("/chat-messages", chatMessagesRouter);
const groupChatRouter = require("./routes/GroupChats");
app.use("/group-chats", groupChatRouter);
const groupChatMessagesRouter = require("./routes/GroupChatMessages");
app.use("/group-chat-messages", groupChatMessagesRouter);

// WebSocket
const socketio = require("./socket/Socket");

db.sequelize.sync().then(() => {
  server.listen(process.env.PORT || 3001, () => {
    console.log("server running");
  });

  const io = socketio.getIO(server);
});
