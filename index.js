const { Server } = require("socket.io");

PORT = process.env.PORT || 8080;

const io = new Server( PORT,{
  cors: true,
});


const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socker connected`, socket.id);

  socket.on("room:join", (data) => {
    const { room, email } = data;
    console.log("User", email, "joined room", room);
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    socket.join(room);
    socket.emit("joined-room", { room });
    socket.broadcast.to(room).emit("user-joined", { email });
  });

  socket.on("call-user", (data) => {
    const { email, offer } = data;
    const fromEmail = socketIdToEmailMap.get(socket.id);
    const socketId = emailToSocketIdMap.get(email);
    console.log(
      "Calling user",
      email,
      "from",
      fromEmail,
      "with offer",
      offer
    );
    socket.to(socketId).emit("incoming-call", { from: fromEmail, offer });
  });

  socket.on("call-accepted", (data) => {
    const { email, ans } = data;
    const fromEmail = socketIdToEmailMap.get(socket.id);
    const socketId = emailToSocketIdMap.get(email);
    console.log(
      "Call accepted by",
      email,
      "from",
      fromEmail,
      "with answer",
      ans
    );
    socket.to(socketId).emit("call-accepted", { from: fromEmail, ans });
  });
});

server.listen(PORT, () => {
  console.log(`HTTP Server is running on port ${PORT}`);
});
