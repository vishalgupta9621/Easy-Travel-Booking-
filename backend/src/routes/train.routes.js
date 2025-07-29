import express from 'express';
import trainController from '../app/api/v1/controllers/train.controller.js';

const router = express.Router();

// Get all trains
router.get('/', trainController.getTrains);

// Get paginated trains
router.get('/paginated', trainController.getPaginatedTrains);

// Search trains
router.get('/search', trainController.searchTrains);

// Get trains by type
router.get('/type/:trainType', trainController.getTrainsByType);

// Get train schedule
router.get('/:id/schedule', trainController.getTrainSchedule);

// Get available seats for a train
router.get('/:id/seats', trainController.getAvailableSeats);

// Get single train
router.get('/:id', trainController.getTrain);

// Create new train
router.post('/', trainController.createTrain);

// Update train
router.put('/:id', trainController.updateTrain);

// Update train status
router.patch('/:id/status', trainController.updateTrainStatus);

// Delete train
router.delete('/:id', trainController.deleteTrain);

export default router;
