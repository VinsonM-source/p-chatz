let username = prompt("Enter your username:");
const socket = io();
socket.emit('set username', username);

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat message', function(data) {
  const item = document.createElement('li');
  const time = new Date(data.timestamp).toLocaleTimeString();
  item.textContent = `[${time}] ${data.username}: ${data.message}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});



socket.on('chat message', async (data) => {
  const chat = new Message({
    username: socket.username || 'Anonymous',
    message: data.message
  });
  await chat.save();

  io.emit('chat message', {
    username: chat.username,
    message: chat.message,
    timestamp: chat.timestamp
  });
});

socket.on('set username', async (username) => {
  socket.username = username;

  // Send the last 20 messages in order
  const messages = await Message.find().sort({ timestamp: 1 }).limit(20);
  messages.forEach((msg) => {
    socket.emit('chat message', {
      username: msg.username,
      message: msg.message,
      timestamp: msg.timestamp
    });
  });
});
