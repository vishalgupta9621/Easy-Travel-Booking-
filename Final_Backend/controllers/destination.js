import Destination from "../models/Destination.js";
import { createError } from "../utils/error.js";
import { validationResult } from "express-validator";

// Get all destinations
export const getDestinations = async (req, res, next) => {
  try {
    const { type, city, state, search, page = 1, limit = 50 } = req.query;
    
    let query = { isActive: true };
    
    // Add filters
    if (type) query.type = type;
    if (city) query.city = new RegExp(city, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    
    const destinations = await Destination.find(query)
      .sort({ city: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Destination.countDocuments(query);
    
    res.status(200).json({
      destinations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDestinations: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get destination by ID
export const getDestinationById = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    
    if (!destination) {
      return next(createError(404, "Destination not found!"));
    }
    
    res.status(200).json(destination);
  } catch (err) {
    next(err);
  }
};

// Get destinations by type (airports, railway stations, bus stations)
export const getDestinationsByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { search, state } = req.query;
    
    let query = { type, isActive: true };
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') }
      ];
    }
    
    if (state) {
      query.state = new RegExp(state, 'i');
    }
    
    const destinations = await Destination.find(query)
      .sort({ city: 1, name: 1 })
      .select('name code city state type');
    
    res.status(200).json(destinations);
  } catch (err) {
    next(err);
  }
};

// Get popular destinations
export const getPopularDestinations = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    let query = { isActive: true };
    if (type) query.type = type;
    
    // For now, return destinations sorted by city name
    // In a real app, you'd track booking frequency
    const destinations = await Destination.find(query)
      .sort({ city: 1 })
      .limit(20)
      .select('name code city state type images');
    
    res.status(200).json(destinations);
  } catch (err) {
    next(err);
  }
};

// Create destination (Admin only)
export const createDestination = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const destination = new Destination(req.body);
    await destination.save();
    
    res.status(201).json({
      message: "Destination created successfully!",
      destination
    });
  } catch (err) {
    if (err.code === 11000) {
      next(createError(400, "Destination code already exists!"));
    } else {
      next(err);
    }
  }
};

// Update destination (Admin only)
export const updateDestination = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!destination) {
      return next(createError(404, "Destination not found!"));
    }
    
    res.status(200).json({
      message: "Destination updated successfully!",
      destination
    });
  } catch (err) {
    next(err);
  }
};

// Delete destination (Admin only)
export const deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!destination) {
      return next(createError(404, "Destination not found!"));
    }
    
    res.status(200).json({
      message: "Destination deactivated successfully!"
    });
  } catch (err) {
    next(err);
  }
};

// Get cities with destinations
export const getCitiesWithDestinations = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    let matchQuery = { isActive: true };
    if (type) matchQuery.type = type;
    
    const cities = await Destination.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$city",
          state: { $first: "$state" },
          count: { $sum: 1 },
          types: { $addToSet: "$type" },
          destinations: { 
            $push: { 
              id: "$_id", 
              name: "$name", 
              code: "$code", 
              type: "$type" 
            } 
          }
        }
      },
      {
        $project: {
          city: "$_id",
          state: 1,
          count: 1,
          types: 1,
          destinations: 1,
          _id: 0
        }
      },
      { $sort: { city: 1 } }
    ]);
    
    res.status(200).json(cities);
  } catch (err) {
    next(err);
  }
};
