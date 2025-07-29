import express from 'express';
import busController from '../app/api/v1/controllers/bus.controller.js';

const router = express.Router();

// Get all buses
router.get('/', busController.getBuses);

// Get paginated buses
router.get('/paginated', busController.getPaginatedBuses);

// Search buses
router.get('/search', busController.searchBuses);

// Get buses by operator
router.get('/operator/:operatorCode', busController.getBusesByOperator);

// Get single bus
router.get('/:id', busController.getBus);

// Create new bus
router.post('/', busController.createBus);

// Update bus
router.put('/:id', busController.updateBus);

// Update bus status
router.patch('/:id/status', busController.updateBusStatus);

// Delete bus
router.delete('/:id', busController.deleteBus);

export default router;
