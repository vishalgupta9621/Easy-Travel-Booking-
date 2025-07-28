import express from "express";
import { body } from "express-validator";
import {
  searchTrains,
  getTrainById,
  getTrainAvailability,
  createTrain,
  updateTrain,
  deleteTrain,
  getAllTrains
} from "../controllers/train.js";
import { verifyAdmin } from "../utils/verifytoken.js";

const router = express.Router();

// Validation for train creation/update
const trainValidation = [
  body('trainNumber')
    .notEmpty()
    .withMessage('Train number is required')
    .matches(/^[0-9]{5}$/)
    .withMessage('Train number must be 5 digits'),
  body('trainName')
    .notEmpty()
    .withMessage('Train name is required')
    .isLength({ max: 100 })
    .withMessage('Train name cannot exceed 100 characters'),
  body('trainType')
    .isIn(['express', 'superfast', 'passenger', 'local', 'rajdhani', 'shatabdi', 'duronto'])
    .withMessage('Invalid train type'),
  body('route.origin')
    .isMongoId()
    .withMessage('Valid origin station ID is required'),
  body('route.destination')
    .isMongoId()
    .withMessage('Valid destination station ID is required'),
  body('schedule.departureTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Departure time must be in HH:MM format'),
  body('schedule.arrivalTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Arrival time must be in HH:MM format'),
  body('schedule.duration')
    .matches(/^[0-9]{1,2}:[0-5][0-9]$/)
    .withMessage('Duration must be in HH:MM format'),
  body('classes')
    .isArray({ min: 1 })
    .withMessage('At least one class is required'),
  body('classes.*.name')
    .notEmpty()
    .withMessage('Class name is required'),
  body('classes.*.code')
    .notEmpty()
    .withMessage('Class code is required'),
  body('classes.*.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Class base price must be a positive number'),
  body('classes.*.totalSeats')
    .isInt({ min: 1 })
    .withMessage('Class total seats must be at least 1')
];

// Public routes
router.get("/search", searchTrains);
router.get("/:id", getTrainById);
router.get("/:id/availability", getTrainAvailability);

// Admin routes
router.get("/", verifyAdmin, getAllTrains);
router.post("/", verifyAdmin, trainValidation, createTrain);
router.put("/:id", verifyAdmin, trainValidation, updateTrain);
router.delete("/:id", verifyAdmin, deleteTrain);

export default router;
