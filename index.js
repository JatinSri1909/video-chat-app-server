const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const app = express();
const io = new Server({
  cors: true,
});

PORT = process.env.PORT || 5000;
SOCKET_PORT = process.env.SOCKET_PORT || 8080;

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log("User", emailId, "joined room", roomId);
    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailMapping.set(socket.id, emailId);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { emailId });
  });

  socket.on("call-user", (data) => {
    const { emailId, offer } = data;
    const fromEmail = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(emailId);
    console.log(
      "Calling user",
      emailId,
      "from",
      fromEmail,
      "with offer",
      offer
    );
    socket.to(socketId).emit("incoming-call", { from: fromEmail, offer });
  });

  socket.on("call-accepted", (data) => {
    const { emailId, ans } = data;
    const fromEmail = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(emailId);
    console.log(
      "Call accepted by",
      emailId,
      "from",
      fromEmail,
      "with answer",
      ans
    );
    socket.to(socketId).emit("call-accepted", { from: fromEmail, ans });
  });
});

io.listen(SOCKET_PORT, () => {
  console.log(`Socket Server is running on port ${SOCKET_PORT}`);
});

app.listen(PORT, () => {
  console.log(`HTTP Server is running on port ${PORT}`);
});
