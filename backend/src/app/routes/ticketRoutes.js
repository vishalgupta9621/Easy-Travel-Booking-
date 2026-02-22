import express from 'express';
import { sendTicketEmail, uploadTicket } from '../controllers/ticketController.js';

const router = express.Router();

// Send ticket via email
router.post('/send-email', uploadTicket, sendTicketEmail);

export default router;
