import express from 'express';
import flightController from '../app/api/v1/controllers/flight.controller.js';

const router = express.Router();

// Get all flights
router.get('/', flightController.getFlights);

// Get paginated flights
router.get('/paginated', flightController.getPaginatedFlights);

// Search flights
router.get('/search', flightController.searchFlights);

// Get flights by airline
router.get('/airline/:airlineCode', flightController.getFlightsByAirline);

// Get available seats for a flight
router.get('/:id/seats', flightController.getAvailableSeats);

// Get single flight
router.get('/:id', flightController.getFlight);

// Create new flight
router.post('/', flightController.createFlight);

// Update flight
router.put('/:id', flightController.updateFlight);

// Update flight status
router.patch('/:id/status', flightController.updateFlightStatus);

// Delete flight
router.delete('/:id', flightController.deleteFlight);

export default router;
