import Flight from "../models/Flight.js";
import TravelBooking from "../models/TravelBooking.js";
import { createError } from "../utils/error.js";
import { validationResult } from "express-validator";

// Search flights
export const searchFlights = async (req, res, next) => {
  try {
    const { origin, destination, departureDate, returnDate, passengers = 1, class: travelClass = 'economy' } = req.query;
    
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

    // Check if flight operates on the requested day
    const dayOfWeek = searchDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    query.$or = [
      { 'schedule.frequency': 'daily' },
      { 
        'schedule.frequency': 'weekly',
        'schedule.operatingDays': dayOfWeek
      }
    ];

    const flights = await Flight.find(query)
      .populate('route.origin', 'name code city')
      .populate('route.destination', 'name code city')
      .populate('route.stops.destination', 'name code city')
      .sort({ 'schedule.departureTime': 1 });

    // Filter flights with available seats
    const availableFlights = [];
    
    for (const flight of flights) {
      const classInfo = flight.pricing[travelClass];
      if (!classInfo || classInfo.totalSeats === 0) continue;

      // Check booked seats for this date
      const bookedSeats = await TravelBooking.countDocuments({
        serviceId: flight._id,
        travelType: 'flight',
        'journey.departureDate': {
          $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
          $lt: new Date(searchDate.setHours(23, 59, 59, 999))
        },
        status: { $in: ['confirmed', 'pending'] }
      });

      const availableSeats = classInfo.totalSeats - bookedSeats;
      
      if (availableSeats >= passengers) {
        const flightData = {
          ...flight.toObject(),
          availableSeats,
          totalPrice: (classInfo.basePrice + classInfo.taxes) * passengers,
          pricePerPerson: classInfo.basePrice + classInfo.taxes
        };
        availableFlights.push(flightData);
      }
    }

    res.status(200).json({
      flights: availableFlights,
      searchCriteria: {
        origin,
        destination,
        departureDate,
        passengers,
        class: travelClass
      },
      totalResults: availableFlights.length
    });
  } catch (err) {
    next(err);
  }
};

// Get flight by ID
export const getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('route.origin', 'name code city state')
      .populate('route.destination', 'name code city state')
      .populate('route.stops.destination', 'name code city');
    
    if (!flight) {
      return next(createError(404, "Flight not found!"));
    }
    
    res.status(200).json(flight);
  } catch (err) {
    next(err);
  }
};

// Get flight availability for specific date
export const getFlightAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, class: travelClass = 'economy' } = req.query;
    
    if (!date) {
      return next(createError(400, "Date is required!"));
    }

    const flight = await Flight.findById(id);
    if (!flight) {
      return next(createError(404, "Flight not found!"));
    }

    const searchDate = new Date(date);
    const classInfo = flight.pricing[travelClass];
    
    if (!classInfo) {
      return next(createError(400, "Invalid travel class!"));
    }

    // Check booked seats for this date
    const bookedSeats = await TravelBooking.countDocuments({
      serviceId: flight._id,
      travelType: 'flight',
      'journey.departureDate': {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['confirmed', 'pending'] }
    });

    const availableSeats = classInfo.totalSeats - bookedSeats;
    
    res.status(200).json({
      flightId: id,
      date,
      class: travelClass,
      totalSeats: classInfo.totalSeats,
      bookedSeats,
      availableSeats,
      price: classInfo.basePrice + classInfo.taxes,
      isAvailable: availableSeats > 0
    });
  } catch (err) {
    next(err);
  }
};

// Create flight (Admin only)
export const createFlight = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const flight = new Flight(req.body);
    await flight.save();
    
    res.status(201).json({
      message: "Flight created successfully!",
      flight
    });
  } catch (err) {
    next(err);
  }
};

// Update flight (Admin only)
export const updateFlight = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!flight) {
      return next(createError(404, "Flight not found!"));
    }
    
    res.status(200).json({
      message: "Flight updated successfully!",
      flight
    });
  } catch (err) {
    next(err);
  }
};

// Delete flight (Admin only)
export const deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    
    if (!flight) {
      return next(createError(404, "Flight not found!"));
    }
    
    res.status(200).json({
      message: "Flight deactivated successfully!"
    });
  } catch (err) {
    next(err);
  }
};

// Get all flights (Admin only)
export const getAllFlights = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, airline } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (airline) query['airline.code'] = airline;
    
    const skip = (page - 1) * limit;
    
    const flights = await Flight.find(query)
      .populate('route.origin', 'name code city')
      .populate('route.destination', 'name code city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Flight.countDocuments(query);
    
    res.status(200).json({
      flights,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFlights: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};
