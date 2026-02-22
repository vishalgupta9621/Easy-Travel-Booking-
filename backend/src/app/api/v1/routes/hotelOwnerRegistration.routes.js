import express from 'express';
import hotelOwnerRegistrationController from '../controllers/hotelOwnerRegistration.controller.js';

const router = express.Router();

// POST /api/v1/hotel-owner-registration - Submit hotel owner registration
router.post('/', hotelOwnerRegistrationController.submitRegistration);

// GET /api/v1/hotel-owner-registration/status/:email - Get registration status (optional)
router.get('/status/:email', hotelOwnerRegistrationController.getRegistrationStatus);

export default router;
