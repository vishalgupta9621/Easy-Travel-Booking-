import express from "express";
import { body } from "express-validator";
import {
  searchBuses,
  getBusById,
  getBusAvailability,
  getBusSeatMap,
  createBus,
  updateBus,
  deleteBus,
  getAllBuses
} from "../controllers/bus.js";
import { verifyAdmin } from "../utils/verifytoken.js";

const router = express.Router();

// Validation for bus creation/update
const busValidation = [
  body('busNumber')
    .notEmpty()
    .withMessage('Bus number is required')
    .isLength({ max: 20 })
    .withMessage('Bus number cannot exceed 20 characters'),
  body('operator.name')
    .notEmpty()
    .withMessage('Operator name is required'),
  body('operator.code')
    .notEmpty()
    .withMessage('Operator code is required'),
  body('busType')
    .isIn(['ac_sleeper', 'non_ac_sleeper', 'ac_seater', 'non_ac_seater', 'volvo', 'luxury'])
    .withMessage('Invalid bus type'),
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
    .matches(/^[0-9]{1,2}:[0-5][0-9]$/)
    .withMessage('Duration must be in HH:MM format'),
  body('seating.totalSeats')
    .isInt({ min: 1, max: 60 })
    .withMessage('Total seats must be between 1 and 60'),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('seating.seatConfiguration')
    .isArray({ min: 1 })
    .withMessage('Seat configuration is required'),
  body('seating.seatConfiguration.*.seatNumber')
    .notEmpty()
    .withMessage('Seat number is required'),
  body('seating.seatConfiguration.*.price')
    .isFloat({ min: 0 })
    .withMessage('Seat price must be a positive number')
];

// Public routes
router.get("/search", searchBuses);
router.get("/:id", getBusById);
router.get("/:id/availability", getBusAvailability);
router.get("/:id/seatmap", getBusSeatMap);

// Admin routes
router.get("/", verifyAdmin, getAllBuses);
router.post("/", verifyAdmin, busValidation, createBus);
router.put("/:id", verifyAdmin, busValidation, updateBus);
router.delete("/:id", verifyAdmin, deleteBus);

export default router;
