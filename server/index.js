const http = require("http");
const { Server } = require("socket.io");

const IP_ADDRESS = "127.0.0.1";
const PORT = 8002;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("room:join", ({ room }) => {
    socket.join(room);
    io.to(room).emit("user:joined", { id: socket.id });
    io.to(socket.id).emit("room:join", { room });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

server.listen(PORT, IP_ADDRESS, () => {
  console.log(`Socket.IO server running at http://${IP_ADDRESS}:${PORT}`);
});
