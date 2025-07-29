import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingByNumber,
  getUserBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingStats
} from '../controllers/bookingController.js';

const router = express.Router();

// Get all bookings (for admin)
router.get('/', getAllBookings);

// Create a new booking
router.post('/', createBooking);

// Get booking by booking number
router.get('/number/:bookingNumber', getBookingByNumber);

// Get all bookings for a user
router.get('/user/:userId', getUserBookings);

// Update booking status
router.put('/status/:bookingNumber', updateBookingStatus);

// Cancel booking
router.put('/cancel/:bookingNumber', cancelBooking);

// Get booking statistics
router.get('/stats', getBookingStats);

export default router;
