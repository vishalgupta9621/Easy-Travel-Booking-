import express from 'express';
import {
  createOrder,
  verifyPayment,
  handlePaymentFailure,
  getRazorpayKey,
  testConnection
} from '../app/controllers/razorpayController.js';

const router = express.Router();

// Create Razorpay order
router.post('/create-order', createOrder);

// Verify payment
router.post('/verify-payment', verifyPayment);

// Handle payment failure
router.post('/payment-failure', handlePaymentFailure);

// Get Razorpay key
router.get('/key', getRazorpayKey);

// Test Razorpay connection
router.get('/test', testConnection);

export default router;
