import express from 'express';
import universalBookingController from '../app/api/v1/controllers/universalBooking.controller.js';

const router = express.Router();

// Get all universal bookings
router.get('/', universalBookingController.getUniversalBookings);

// Get paginated universal bookings
router.get('/paginated', universalBookingController.getPaginatedUniversalBookings);

// Search bookings
router.get('/search', universalBookingController.searchBookings);

// Get booking stats
router.get('/stats', universalBookingController.getBookingStats);

// Get bookings by date range
router.get('/date-range', universalBookingController.getBookingsByDateRange);

// Get bookings by user
router.get('/user/:userId', universalBookingController.getBookingsByUser);

// Get bookings by type
router.get('/type/:bookingType', universalBookingController.getBookingsByType);

// Get single universal booking
router.get('/:id', universalBookingController.getUniversalBooking);

// Create new universal booking
router.post('/', universalBookingController.createUniversalBooking);

// Update universal booking
router.put('/:id', universalBookingController.updateUniversalBooking);

// Update booking status
router.patch('/:id/status', universalBookingController.updateBookingStatus);

// Update payment status
router.patch('/:id/payment', universalBookingController.updatePaymentStatus);

// Delete universal booking
router.delete('/:id', universalBookingController.deleteUniversalBooking);

export default router;
