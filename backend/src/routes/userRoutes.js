const express = require('express');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    res.status(201).json({ message: 'User registered', data: req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    res.json({ message: 'User logged in', data: req.body });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    res.json({ message: 'User profile' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    res.json({ message: 'Profile updated', data: req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 