const express = require('express');
const authController = require('../controllers/authController');
const User = require('../models/User');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ userId: user._id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router;
