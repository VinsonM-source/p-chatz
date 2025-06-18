// server.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();


// Setup Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true
})
.then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


// Message Schema
const Message = mongoose.model('Message', {
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

// Serve static files (optional)
app.use(express.static('public'));

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  socket.on('set username', async (username) => {
    socket.username = username;

    try {
      const messages = await Message.find().sort({ timestamp: 1 }).limit(20);

      messages.forEach((msg) => {
        socket.emit('chat message', {
          username: msg.username,
          message: msg.message,
          timestamp: msg.timestamp
        });
      });
    } catch (err) {
      console.error('❌ Error loading messages:', err.message);
    }
  });

  socket.on('chat message', async (data) => {
    const chat = new Message({
      username: socket.username || 'Anonymous',
      message: data.message,
      timestamp: Date.now()
    });

    try {
      await chat.save(); // Save to MongoDB
      io.emit('chat message', {
        username: chat.username,
        message: chat.message,
        timestamp: chat.timestamp
      });
    } catch (err) {
      console.error('❌ Error saving message:', err.message);
    }
  });

  socket.emit('chat message', {
  username: msg.username,
  message: msg.message,
  timestamp: msg.timestamp
});


  socket.on('disconnect', () => {
    console.log('🔴 User disconnected');
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
