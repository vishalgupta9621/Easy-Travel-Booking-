import express from 'express';
import hotelOwnerDashboardController from '../app/api/v1/controllers/hotelOwnerDashboard.controller.js';

const router = express.Router();

// Get all bookings for hotels owned by a specific owner
router.get('/owner/:ownerEmail/bookings', hotelOwnerDashboardController.getOwnerBookings);

// Get booking statistics for hotel owner
router.get('/owner/:ownerEmail/stats', hotelOwnerDashboardController.getOwnerBookingStats);

// Get bookings for a specific hotel (with owner verification)
router.get('/hotel/:hotelId/bookings', hotelOwnerDashboardController.getHotelBookings);

// Get owner's hotels
router.get('/owner/:ownerEmail/hotels', hotelOwnerDashboardController.getOwnerHotels);

// Update booking status (for hotel owner)
router.patch('/booking/:bookingId/status', hotelOwnerDashboardController.updateBookingStatus);

export default router;
