const express = require('express');
const { chatWithBot } = require('../controllers/chatbotController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Chatbot endpoint - uses optional auth (works with or without login)
router.post('/chat', optionalAuth, chatWithBot);

module.exports = router;
