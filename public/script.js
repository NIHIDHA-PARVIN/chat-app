const socket = io();
const username = localStorage.getItem("username") || "Guest";
socket.emit("new user", username);

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const userList = document.getElementById("user-list");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    const time = new Date().toLocaleTimeString();
    socket.emit("chat message", {
      user: username,
      text: input.value,
      time
    });
    input.value = "";
  }
});
socket.on("chat message", (msg) => {
  const item = document.createElement("li");
  const isSelf = msg.user === username;

  item.classList.add("message", isSelf ? "sent" : "received");

  item.innerHTML = `
    ${!isSelf ? `<div class="sender-name">${msg.user}</div>` : ""}
    <div class="text">${msg.text}</div>
    <div class="time">${msg.time}</div>
  `;

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});



socket.on("user list", (users) => {
  userList.innerHTML = "";
  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user;
    userList.appendChild(li);
  });
});

socket.on("user joined", (name) => {
  const item = document.createElement("li");
  item.textContent = `${name} joined the chat`;
  item.style.fontStyle = "italic";
  messages.appendChild(item);
});

socket.on("user left", (name) => {
  const item = document.createElement("li");
  item.textContent = `${name} left the chat`;
  item.style.fontStyle = "italic";
  messages.appendChild(item);
});
// Typing feature
input.addEventListener("input", () => {
  socket.emit("typing", username);
  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    socket.emit("stop typing", username);
  }, 1000);
});

socket.on("typing", (name) => {
  showTyping(`${name} is typing...`);
});

socket.on("stop typing", () => {
  showTyping("");
});

function showTyping(message) {
  let typingArea = document.getElementById("typing-area");
  if (!typingArea) return;
  typingArea.textContent = message;
  typingArea.style.fontStyle = "italic";
  typingArea.style.color = "#888";
  typingArea.style.margin = "5px 15px";
}


function logout() {
  localStorage.removeItem("username");
  window.location.href = "index.html";
}
