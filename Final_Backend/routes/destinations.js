import express from "express";
import { body } from "express-validator";
import {
  getDestinations,
  getDestinationById,
  getDestinationsByType,
  getPopularDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getCitiesWithDestinations
} from "../controllers/destination.js";
import { verifyAdmin } from "../utils/verifytoken.js";

const router = express.Router();

// Validation for destination creation/update
const destinationValidation = [
  body('name')
    .notEmpty()
    .withMessage('Destination name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('code')
    .notEmpty()
    .withMessage('Destination code is required')
    .isLength({ min: 3, max: 10 })
    .withMessage('Code must be between 3 and 10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must contain only uppercase letters and numbers'),
  body('city')
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .notEmpty()
    .withMessage('State is required'),
  body('type')
    .isIn(['airport', 'railway_station', 'bus_station'])
    .withMessage('Type must be airport, railway_station, or bus_station')
];

// Public routes
router.get("/", getDestinations);
router.get("/popular", getPopularDestinations);
router.get("/cities", getCitiesWithDestinations);
router.get("/type/:type", getDestinationsByType);
router.get("/:id", getDestinationById);

// Admin routes
router.post("/", verifyAdmin, destinationValidation, createDestination);
router.put("/:id", verifyAdmin, destinationValidation, updateDestination);
router.delete("/:id", verifyAdmin, deleteDestination);

export default router;
