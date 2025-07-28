import express from "express";
import { body } from "express-validator";
import {
  createTravelBooking,
  getUserTravelBookings,
  getTravelBookingById,
  cancelTravelBooking,
  getAllTravelBookings
} from "../controllers/travelBooking.js";
import { verifyUser, verifyAdmin } from "../utils/verifytoken.js";

const router = express.Router();

// Validation for travel booking creation
const travelBookingValidation = [
  body('travelType')
    .isIn(['flight', 'train', 'bus'])
    .withMessage('Travel type must be flight, train, or bus'),
  body('serviceId')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  body('journey.origin')
    .isMongoId()
    .withMessage('Valid origin destination ID is required'),
  body('journey.destination')
    .isMongoId()
    .withMessage('Valid destination ID is required'),
  body('journey.departureDate')
    .isISO8601()
    .withMessage('Valid departure date is required'),
  body('journey.arrivalDate')
    .isISO8601()
    .withMessage('Valid arrival date is required'),
  body('journey.departureTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Departure time must be in HH:MM format'),
  body('journey.arrivalTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Arrival time must be in HH:MM format'),
  body('passengers')
    .isArray({ min: 1, max: 9 })
    .withMessage('At least 1 and maximum 9 passengers allowed'),
  body('passengers.*.firstName')
    .notEmpty()
    .withMessage('Passenger first name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('passengers.*.lastName')
    .notEmpty()
    .withMessage('Passenger last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('passengers.*.age')
    .isInt({ min: 0, max: 120 })
    .withMessage('Valid passenger age is required'),
  body('passengers.*.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Valid gender is required'),
  body('contact.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('contact.phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian phone number is required'),
  body('payment.method')
    .isIn(['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'])
    .withMessage('Valid payment method is required'),
  body('payment.transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required')
];

// Validation for booking cancellation
const cancellationValidation = [
  body('cancellationReason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters')
];

// User routes
router.post("/", verifyUser, travelBookingValidation, createTravelBooking);
router.get("/user", verifyUser, getUserTravelBookings);
router.get("/:id", verifyUser, getTravelBookingById);
router.put("/:id/cancel", verifyUser, cancellationValidation, cancelTravelBooking);

// Admin routes
router.get("/", verifyAdmin, getAllTravelBookings);

export default router;
