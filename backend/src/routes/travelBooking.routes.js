import express from 'express';
import travelBookingController from '../app/api/v1/controllers/travelBooking.controller.js';

const router = express.Router();

// Get all travel bookings
router.get('/', travelBookingController.getTravelBookings);

// Get paginated travel bookings
router.get('/paginated', travelBookingController.getPaginatedTravelBookings);

// Get bookings by date range
router.get('/date-range', travelBookingController.getBookingsByDateRange);

// Get bookings by user
router.get('/user/:userId', travelBookingController.getBookingsByUser);

// Get bookings by type
router.get('/type/:travelType', travelBookingController.getBookingsByType);

// Get single travel booking
router.get('/:id', travelBookingController.getTravelBooking);

// Create new travel booking
router.post('/', travelBookingController.createTravelBooking);

// Update travel booking
router.put('/:id', travelBookingController.updateTravelBooking);

// Update booking status
router.patch('/:id/status', travelBookingController.updateBookingStatus);

// Update payment status
router.patch('/:id/payment', travelBookingController.updatePaymentStatus);

// Cancel booking
router.patch('/:id/cancel', travelBookingController.cancelBooking);

// Delete travel booking
router.delete('/:id', travelBookingController.deleteTravelBooking);

export default router;
