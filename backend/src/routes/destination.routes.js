import express from 'express';
import Destination from '../app/models/Destination.js';

const router = express.Router();

// Get all destinations
router.get('/', async (req, res, next) => {
  try {
    const { type, city } = req.query;
    let query = { isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    
    const destinations = await Destination.find(query)
      .sort({ city: 1, name: 1 })
      .limit(100);
    
    res.json(destinations);
  } catch (error) {
    next(error);
  }
});

// Search destinations by city
router.get('/search', async (req, res, next) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    const destinations = await Destination.find({
      city: { $regex: city, $options: 'i' },
      isActive: true
    }).sort({ city: 1, name: 1 });
    
    res.json(destinations);
  } catch (error) {
    next(error);
  }
});

// Get destination by ID
router.get('/:id', async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    res.json(destination);
  } catch (error) {
    next(error);
  }
});

// Create new destination
router.post('/', async (req, res, next) => {
  try {
    const destination = new Destination(req.body);
    await destination.save();
    res.status(201).json(destination);
  } catch (error) {
    next(error);
  }
});

export default router;
