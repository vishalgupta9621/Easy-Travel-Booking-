import express from 'express';
import {
  createChatContact,
  getAllChatContacts,
  getPendingContacts,
  updateContactStatus,
  addNoteToContact,
  getContactById,
  getContactStats
} from '../app/controllers/chatContact.controller.js';

const router = express.Router();

// Public routes
router.post('/', createChatContact);

// Admin routes (you can add authentication middleware later)
router.get('/', getAllChatContacts);
router.get('/pending', getPendingContacts);
router.get('/stats', getContactStats);
router.get('/:id', getContactById);
router.put('/:id', updateContactStatus);
router.post('/:id/notes', addNoteToContact);

export default router;
