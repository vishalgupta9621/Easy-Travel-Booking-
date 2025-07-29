import express from 'express';
import hotelBookingController from '../app/api/v1/controllers/hotelBooking.controller.js';

const router = express.Router();

// Get all hotel bookings
router.get('/', hotelBookingController.getHotelBookings);

// Get paginated hotel bookings
router.get('/paginated', hotelBookingController.getPaginatedHotelBookings);

// Get bookings by date range
router.get('/date-range', hotelBookingController.getBookingsByDateRange);

// Get bookings by user
router.get('/user/:userId', hotelBookingController.getBookingsByUser);

// Get bookings by hotel
router.get('/hotel/:hotelId', hotelBookingController.getBookingsByHotel);

// Get single hotel booking
router.get('/:id', hotelBookingController.getHotelBooking);

// Create new hotel booking
router.post('/', hotelBookingController.createHotelBooking);

// Update hotel booking
router.put('/:id', hotelBookingController.updateHotelBooking);

// Update booking status
router.patch('/:id/status', hotelBookingController.updateBookingStatus);

// Update payment status
router.patch('/:id/payment', hotelBookingController.updatePaymentStatus);

// Check-in
router.patch('/:id/checkin', hotelBookingController.checkIn);

// Check-out
router.patch('/:id/checkout', hotelBookingController.checkOut);

// Delete hotel booking
router.delete('/:id', hotelBookingController.deleteHotelBooking);

export default router;
