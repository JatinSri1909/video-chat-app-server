const { Server } = require("socket.io");

port = process.env.PORT || 8080;

const io = new Server(port, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected with ${socket.id}`);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    //io.to(socket.id).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    socket.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("join:room", data);
  });

  socket.on("user:call", (data) => {
    const { to, offer } = data;
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

console.log(`Hello from the socket server running at port ${port}`);
