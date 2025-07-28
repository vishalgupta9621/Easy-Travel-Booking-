import express from "express";
import { body } from "express-validator";
import {
  searchFlights,
  getFlightById,
  getFlightAvailability,
  createFlight,
  updateFlight,
  deleteFlight,
  getAllFlights
} from "../controllers/flight.js";
import { verifyAdmin } from "../utils/verifytoken.js";

const router = express.Router();

// Validation for flight creation/update
const flightValidation = [
  body('flightNumber')
    .notEmpty()
    .withMessage('Flight number is required')
    .matches(/^[A-Z0-9]{2,3}[0-9]{3,4}$/)
    .withMessage('Invalid flight number format'),
  body('airline.name')
    .notEmpty()
    .withMessage('Airline name is required'),
  body('airline.code')
    .notEmpty()
    .withMessage('Airline code is required')
    .isLength({ min: 2, max: 3 })
    .withMessage('Airline code must be 2-3 characters'),
  body('route.origin')
    .isMongoId()
    .withMessage('Valid origin destination ID is required'),
  body('route.destination')
    .isMongoId()
    .withMessage('Valid destination ID is required'),
  body('schedule.departureTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Departure time must be in HH:MM format'),
  body('schedule.arrivalTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Arrival time must be in HH:MM format'),
  body('schedule.duration')
    .isInt({ min: 30 })
    .withMessage('Duration must be at least 30 minutes'),
  body('pricing.economy.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Economy base price must be a positive number'),
  body('pricing.economy.totalSeats')
    .isInt({ min: 1 })
    .withMessage('Economy total seats must be at least 1'),
  body('aircraft.capacity')
    .isInt({ min: 1 })
    .withMessage('Aircraft capacity must be at least 1')
];

// Public routes
router.get("/search", searchFlights);
router.get("/:id", getFlightById);
router.get("/:id/availability", getFlightAvailability);

// Admin routes
router.get("/", verifyAdmin, getAllFlights);
router.post("/", verifyAdmin, flightValidation, createFlight);
router.put("/:id", verifyAdmin, flightValidation, updateFlight);
router.delete("/:id", verifyAdmin, deleteFlight);

export default router;
