const User = require('../models/User');
const Message = require('../models/Message');
const { spawn } = require('child_process');

// Define the functions
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendMessage = async (req, res) => {
  const { senderUsername, receiverUsername, message } = req.body;

  try {
    // Find sender and receiver by username
    const sender = await User.findOne({ username: senderUsername });
    const receiver = await User.findOne({ username: receiverUsername });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    // Create a new message
    const newMessage = new Message({
      senderId: sender._id,  // Store ObjectId
      receiverId: receiver._id, // Store ObjectId
      message: message,
    });

    // Save the message to database
    await newMessage.save();

    // Emit message to receiver via Socket.io
    io.to(receiver._id.toString()).emit('receiveMessage', {
      senderUsername: sender.username,
      message: message,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const connectToAgent = async (req, res) => {
  const { userId } = req.body;
  try {
    const agent = await User.findOne({ role: 'admin', isActive: true });
    if (!agent) {
      return res.status(404).json({ message: 'Customer support is not active. Try again later.' });
    }
    res.json({ message: 'Successfully connected to customer agent', agentId: agent._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



const getChatbotResponse = async (req, res) => {
    const { message } = req.body;
  
    // Log the input message
    console.log(`Input message received: ${message}`);
  
    // Spawn the Python process
    const pythonProcess = spawn('python3', ['script.py', message]);
  
    let response = '';
  
    // Capture stdout data
    pythonProcess.stdout.on('data', (data) => {
      response += data.toString();
    });
  
    // Handle errors
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script error: ${data}`);
    });
  
    // Handle process close
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Log the Python script output
        console.log(`Python script output: ${response.trim()}`);
        // Send the response back to the client
        res.json({ response: response.trim() }); // Trim any extra whitespace
      } else {
        console.error(`Python script exited with code ${code}`);
        res.status(500).json({ error: 'Python script execution failed' });
      }
    });
  };
// Export

// Export the functions
module.exports = {
  getMessages,
  sendMessage,
  connectToAgent,
  getChatbotResponse
};