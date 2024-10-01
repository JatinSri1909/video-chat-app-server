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

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("Negotiation needed", to, offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("Negotiation done", to, ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
