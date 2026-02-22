import express from 'express';
import {
  saveChatMessage,
  getChatHistory,
  getRecentSessions,
  linkChatToContact,
  endChatSession,
  getAllChatSessions
} from '../app/controllers/chatHistory.controller.js';

const router = express.Router();

// Save chat message
router.post('/message', saveChatMessage);

// Get chat history for a session
router.get('/session/:sessionId', getChatHistory);

// Get recent sessions for a user
router.get('/user/:userIdentifier/recent', getRecentSessions);

// Link chat session to contact
router.post('/link-contact', linkChatToContact);

// End chat session
router.put('/session/:sessionId/end', endChatSession);

// Get all chat sessions (admin)
router.get('/admin/sessions', getAllChatSessions);

export default router;
