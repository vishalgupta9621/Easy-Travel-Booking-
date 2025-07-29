import express from 'express';
import packageController from '../app/api/v1/controllers/package.controller.js';

const router = express.Router();

// Search packages
router.get('/search', packageController.searchPackages);

// Get popular packages
router.get('/popular', packageController.getPopularPackages);

// Get package bookings (admin) - must be before /:packageId routes
router.get('/bookings/all', packageController.getPackageBookings);

// Get packages by destination
router.get('/destination/:destination', packageController.getPackagesByDestination);

// Get package options (hotel, transport, add-ons)
router.get('/:packageId/options', packageController.getPackageOptions);

// Calculate dynamic pricing
router.post('/:packageId/calculate-price', packageController.calculateDynamicPrice);

// Get package details
router.get('/:packageId', packageController.getPackageDetails);

// Create new package (admin)
router.post('/', packageController.createPackage);

// Update package (admin)
router.put('/:packageId', packageController.updatePackage);

// Delete package (admin)
router.delete('/:packageId', packageController.deletePackage);

// Create package booking
router.post('/book', packageController.createPackageBooking);

export default router;
