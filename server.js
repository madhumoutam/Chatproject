const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');  
const Message = require('./models/Message');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// MongoDB connection
mongoose.connect('mongodb+srv://Madhu123:Madhu123@cluster0.tbnz2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// WebSocket Setup
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', (username) => {
    socket.join(username);
    console.log(`${username} joined the room`);
  });

  socket.on('sendMessage', async ({ senderUsername, receiverUsername, message }) => {
    try {
      const sender = await User.findOne({ username: senderUsername });
      const receiver = await User.findOne({ username: receiverUsername });
  
      if (!sender || !receiver) {
        console.error('Sender or receiver not found');
        return;
      }
  
      // Save the message to MongoDB
      const newMessage = new Message({
        senderId: sender._id,
        receiverId: receiver._id,
        message: message,
        timestamp: new Date(),
      });
  
      await newMessage.save();
  
      // Emit message to the receiver's room
      io.to(receiverUsername).emit('receiveMessage', {
        senderUsername: senderUsername,
        message: message,
      });
  
      console.log(`Message sent from ${senderUsername} to ${receiverUsername}: ${message}`);
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
app.post('/test-message', (req, res) => {
  const { senderUsername, receiverUsername, message } = req.body;

  if (!senderUsername || !receiverUsername || !message) {
    return res.status(400).json({ error: 'senderUsername, receiverUsername, and message are required' });
  }

  // Emit the message to the receiver's room
  io.to(receiverUsername).emit('receiveMessage', {
    senderUsername: senderUsername,
    message: message,
  });

  res.json({ success: true, message: `Message sent to ${receiverUsername}` });
});
server.listen(3000, () => console.log('Server running on port 3000'));
