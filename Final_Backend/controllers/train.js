import Train from "../models/Train.js";
import TravelBooking from "../models/TravelBooking.js";
import { createError } from "../utils/error.js";
import { validationResult } from "express-validator";

// Search trains
export const searchTrains = async (req, res, next) => {
  try {
    const { origin, destination, departureDate, class: travelClass, passengers = 1 } = req.query;
    
    if (!origin || !destination || !departureDate) {
      return next(createError(400, "Origin, destination, and departure date are required!"));
    }

    const searchDate = new Date(departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (searchDate < today) {
      return next(createError(400, "Departure date cannot be in the past!"));
    }

    // Build query
    let query = {
      'route.origin': origin,
      'route.destination': destination,
      status: 'active',
      'schedule.validFrom': { $lte: searchDate },
      'schedule.validTo': { $gte: searchDate }
    };

    // Check if train operates on the requested day
    const dayOfWeek = searchDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    query.$or = [
      { 'schedule.frequency': 'daily' },
      { 
        'schedule.frequency': { $in: ['weekly', 'bi_weekly', 'specific_days'] },
        'schedule.operatingDays': dayOfWeek
      }
    ];

    const trains = await Train.find(query)
      .populate('route.origin', 'name code city')
      .populate('route.destination', 'name code city')
      .populate('route.stations.station', 'name code city')
      .sort({ 'schedule.departureTime': 1 });

    // Filter trains with available seats
    const availableTrains = [];
    
    for (const train of trains) {
      let classInfo = null;
      
      if (travelClass) {
        classInfo = train.classes.find(c => c.code === travelClass);
        if (!classInfo) continue;
      }

      // Check booked seats for this date
      const bookedSeats = await TravelBooking.countDocuments({
        serviceId: train._id,
        travelType: 'train',
        'journey.departureDate': {
          $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
          $lt: new Date(searchDate.setHours(23, 59, 59, 999))
        },
        status: { $in: ['confirmed', 'pending'] },
        ...(travelClass && { 'bookingDetails.trainClass': travelClass })
      });

      const trainData = {
        ...train.toObject(),
        availableClasses: []
      };

      // Check availability for each class
      for (const cls of train.classes) {
        const classBookedSeats = await TravelBooking.countDocuments({
          serviceId: train._id,
          travelType: 'train',
          'journey.departureDate': {
            $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
            $lt: new Date(searchDate.setHours(23, 59, 59, 999))
          },
          status: { $in: ['confirmed', 'pending'] },
          'bookingDetails.trainClass': cls.code
        });

        const availableSeats = cls.totalSeats - classBookedSeats;
        
        if (availableSeats >= passengers) {
          trainData.availableClasses.push({
            ...cls.toObject(),
            availableSeats,
            totalPrice: cls.basePrice * passengers,
            pricePerPerson: cls.basePrice
          });
        }
      }

      if (trainData.availableClasses.length > 0) {
        availableTrains.push(trainData);
      }
    }

    res.status(200).json({
      trains: availableTrains,
      searchCriteria: {
        origin,
        destination,
        departureDate,
        passengers,
        class: travelClass
      },
      totalResults: availableTrains.length
    });
  } catch (err) {
    next(err);
  }
};

// Get train by ID
export const getTrainById = async (req, res, next) => {
  try {
    const train = await Train.findById(req.params.id)
      .populate('route.origin', 'name code city state')
      .populate('route.destination', 'name code city state')
      .populate('route.stations.station', 'name code city');
    
    if (!train) {
      return next(createError(404, "Train not found!"));
    }
    
    res.status(200).json(train);
  } catch (err) {
    next(err);
  }
};

// Get train availability for specific date and class
export const getTrainAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, class: travelClass } = req.query;
    
    if (!date || !travelClass) {
      return next(createError(400, "Date and class are required!"));
    }

    const train = await Train.findById(id);
    if (!train) {
      return next(createError(404, "Train not found!"));
    }

    const searchDate = new Date(date);
    const classInfo = train.classes.find(c => c.code === travelClass);
    
    if (!classInfo) {
      return next(createError(400, "Invalid train class!"));
    }

    // Check booked seats for this date and class
    const bookedSeats = await TravelBooking.countDocuments({
      serviceId: train._id,
      travelType: 'train',
      'journey.departureDate': {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      },
      'bookingDetails.trainClass': travelClass,
      status: { $in: ['confirmed', 'pending'] }
    });

    const availableSeats = classInfo.totalSeats - bookedSeats;
    
    res.status(200).json({
      trainId: id,
      date,
      class: travelClass,
      className: classInfo.name,
      totalSeats: classInfo.totalSeats,
      bookedSeats,
      availableSeats,
      price: classInfo.basePrice,
      isAvailable: availableSeats > 0,
      amenities: classInfo.amenities
    });
  } catch (err) {
    next(err);
  }
};

// Create train (Admin only)
export const createTrain = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const train = new Train(req.body);
    await train.save();
    
    res.status(201).json({
      message: "Train created successfully!",
      train
    });
  } catch (err) {
    if (err.code === 11000) {
      next(createError(400, "Train number already exists!"));
    } else {
      next(err);
    }
  }
};

// Update train (Admin only)
export const updateTrain = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const train = await Train.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!train) {
      return next(createError(404, "Train not found!"));
    }
    
    res.status(200).json({
      message: "Train updated successfully!",
      train
    });
  } catch (err) {
    next(err);
  }
};

// Delete train (Admin only)
export const deleteTrain = async (req, res, next) => {
  try {
    const train = await Train.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    
    if (!train) {
      return next(createError(404, "Train not found!"));
    }
    
    res.status(200).json({
      message: "Train deactivated successfully!"
    });
  } catch (err) {
    next(err);
  }
};

// Get all trains (Admin only)
export const getAllTrains = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, trainType } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (trainType) query.trainType = trainType;
    
    const skip = (page - 1) * limit;
    
    const trains = await Train.find(query)
      .populate('route.origin', 'name code city')
      .populate('route.destination', 'name code city')
      .sort({ trainNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Train.countDocuments(query);
    
    res.status(200).json({
      trains,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrains: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};
