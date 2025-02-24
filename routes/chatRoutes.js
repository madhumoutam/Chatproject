const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const chatController = require('../controllers/chatController');
// Send a message
router.post('/send', async (req, res) => {
    const { senderUsername, receiverUsername, message } = req.body;

    try {
        // Convert usernames to ObjectIds
        const sender = await User.findOne({ username: senderUsername });
        const receiver = await User.findOne({ username: receiverUsername });

        if (!sender) {
            return res.status(404).json({ error: `Sender username '${senderUsername}' not found` });
        }
        if (!receiver) {
            return res.status(404).json({ error: `Receiver username '${receiverUsername}' not found` });
        }

        const newMessage = new Message({
            senderId: sender._id,  // Store ObjectId
            receiverId: receiver._id, // Store ObjectId
            message: message,
            timestamp: new Date()
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve messages between two users
router.get('/messages', async (req, res) => {
    const { senderUsername, receiverUsername } = req.query;

    try {
        const sender = await User.findOne({ username: senderUsername });
        const receiver = await User.findOne({ username: receiverUsername });

        if (!sender || !receiver) {
            return res.status(404).json({ error: 'Sender or receiver not found' });
        }

        const messages = await Message.find({
            $or: [
                { senderId: sender._id, receiverId: receiver._id },
                { senderId: receiver._id, receiverId: sender._id }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/chatbot', chatController.getChatbotResponse);
module.exports = router;
