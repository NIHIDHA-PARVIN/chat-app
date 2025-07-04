/*const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // Serve files from public folder

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // Send to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
*/
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {};

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("new user", (username) => {
    users[socket.id] = username;
    io.emit("user list", Object.values(users));
    socket.broadcast.emit("user joined", username);
  });
  socket.on("typing", (name) => {
  socket.broadcast.emit("typing", name);
});

socket.on("stop typing", (name) => {
  socket.broadcast.emit("stop typing", name);
});


  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit("user list", Object.values(users));
    socket.broadcast.emit("user left", username);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
