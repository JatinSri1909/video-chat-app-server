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
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:joined", room);
  });

  socket.on("user:call", ({ to, offer}) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer});
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
