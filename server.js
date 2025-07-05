const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {};     // { socket.id: username }
const sockets = {};   // { username: socket.id }

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("login", (username) => {
    users[socket.id] = username;
    sockets[username] = socket.id;
    io.emit("user list", Object.values(users));
    socket.broadcast.emit("user joined", username);
  });

  socket.on("private message", ({ from, to, text, time }) => {
    const toSocketId = sockets[to];
    if (toSocketId) {
      io.to(toSocketId).emit("private message", { from, to, text, time });
    }
    socket.emit("private message", { from, to, text, time });
  });

  socket.on("typing", ({ from, to }) => {
    const toSocketId = sockets[to];
    if (toSocketId) {
      io.to(toSocketId).emit("typing", from);
    }
  });

  socket.on("stop typing", ({ from, to }) => {
    const toSocketId = sockets[to];
    if (toSocketId) {
      io.to(toSocketId).emit("stop typing", from);
    }
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete sockets[username];
    delete users[socket.id];
    io.emit("user list", Object.values(users));
    socket.broadcast.emit("user left", username);
  });
});

server.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
