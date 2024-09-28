const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const app = express();
const io = new Server();

PORT = process.env.PORT || 5000;
SOCKET_PORT = process.env.SOCKET_PORT || 8080;

app.use(bodyParser.json());

const emailToSocketMapping = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log("User", emailId, "joined room", roomId);
    emailToSocketMapping.set(emailId, socket.id);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", emailId);
  });
});

io.listen(SOCKET_PORT, () => {
  console.log(`Server is running on port ${SOCKET_PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
