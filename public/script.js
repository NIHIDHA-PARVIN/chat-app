const socket = io();
const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "index.html";
}

let currentChatUser = null;
const chatHistory = {}; // Store chat messages per user

socket.emit("login", username);

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const userList = document.getElementById("user-list");
const header = document.getElementById("chat-header");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value && currentChatUser) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

    const msg = {
      from: username,
      to: currentChatUser,
      text: input.value,
      time,
    };

    socket.emit("private message", msg); // ✅ Only send to server (no local add!)
    input.value = "";
  }
});

socket.on("user list", (users) => {
  userList.innerHTML = "";
  users.forEach((user) => {
    if (user === username) return;
    const li = document.createElement("li");
    li.textContent = user;
    li.style.cursor = "pointer";
    li.classList.add("user-item"); // 👈 for block-style layout
    li.onclick = () => {
      currentChatUser = user;
      header.textContent = user; // ✅ Show only name
      renderChat(user);
    };
    userList.appendChild(li);
  });
});

socket.on("private message", (msg) => {
  addMessageToChat(msg);

  const isSent = msg.from === username;
  const chatPartner = isSent ? msg.to : msg.from;

  if (chatPartner === currentChatUser) {
    renderChat(chatPartner);
  }
});

function addMessageToChat(msg) {
  const isSent = msg.from === username;
  const chatPartner = isSent ? msg.to : msg.from;

  if (!chatHistory[chatPartner]) {
    chatHistory[chatPartner] = [];
  }

  chatHistory[chatPartner].push(msg);
}

function renderChat(user) {
  messages.innerHTML = "";
  const chat = chatHistory[user] || [];

  chat.forEach((msg) => {
    const isSent = msg.from === username;
    const li = document.createElement("li");
    li.classList.add("message", isSent ? "sent" : "received");
    li.innerHTML = `
      <div class="text">${msg.text}</div>
      <div class="time">${msg.time}</div>
    `;
    messages.appendChild(li);
  });

  messages.scrollTop = messages.scrollHeight;
}

// Typing feature
input.addEventListener("input", () => {
  if (currentChatUser) {
    socket.emit("typing", { from: username, to: currentChatUser });
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit("stop typing", { from: username, to: currentChatUser });
    }, 1000);
  }
});

socket.on("typing", (from) => {
  if (from === currentChatUser) {
    document.getElementById("typing-area").textContent = `${from} is typing...`;
  }
});

socket.on("stop typing", (from) => {
  if (from === currentChatUser) {
    document.getElementById("typing-area").textContent = "";
  }
});

function logout() {
  localStorage.removeItem("username");
  window.location.href = "index.html";
}
