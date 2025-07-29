import express from 'express';
import {
  getDashboardStats,
  getBookingTrends
} from '../controllers/dashboardController.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get booking trends for charts
router.get('/trends', getBookingTrends);

export default router;
