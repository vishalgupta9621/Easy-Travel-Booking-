import express from 'express';
import {
  getAllPayments,
  getPaymentsByBooking,
  getPaymentsByUser,
  getPaymentById,
  updatePaymentStatus,
  getPaymentStats
} from '../controllers/paymentController.js';

const router = express.Router();

// Get all payments (for admin)
router.get('/', getAllPayments);

// Get payments by booking number
router.get('/booking/:bookingNumber', getPaymentsByBooking);

// Get payments by user
router.get('/user/:userId', getPaymentsByUser);

// Get payment by payment ID
router.get('/payment/:paymentId', getPaymentById);

// Update payment status
router.put('/status/:paymentId', updatePaymentStatus);

// Get payment statistics
router.get('/stats', getPaymentStats);

export default router;
