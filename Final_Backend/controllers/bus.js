import Bus from "../models/Bus.js";
import TravelBooking from "../models/TravelBooking.js";
import { createError } from "../utils/error.js";
import { validationResult } from "express-validator";

// Search buses
export const searchBuses = async (req, res, next) => {
  try {
    const { origin, destination, departureDate, passengers = 1, busType } = req.query;
    
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

    if (busType) {
      query.busType = busType;
    }

    // Check if bus operates on the requested day
    const dayOfWeek = searchDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    query.$or = [
      { 'schedule.frequency': 'daily' },
      { 
        'schedule.frequency': { $in: ['weekly', 'specific_days'] },
        'schedule.operatingDays': dayOfWeek
      }
    ];

    const buses = await Bus.find(query)
      .populate('route.origin', 'name code city')
      .populate('route.destination', 'name code city')
      .populate('route.stops.location', 'name code city')
      .sort({ 'schedule.departureTime': 1 });

    // Filter buses with available seats
    const availableBuses = [];
    
    for (const bus of buses) {
      // Check booked seats for this date
      const bookedSeats = await TravelBooking.countDocuments({
        serviceId: bus._id,
        travelType: 'bus',
        'journey.departureDate': {
          $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
          $lt: new Date(searchDate.setHours(23, 59, 59, 999))
        },
        status: { $in: ['confirmed', 'pending'] }
      });

      const availableSeats = bus.seating.totalSeats - bookedSeats;
      
      if (availableSeats >= passengers) {
        const busData = {
          ...bus.toObject(),
          availableSeats,
          totalPrice: (bus.basePrice + bus.taxes) * passengers,
          pricePerPerson: bus.basePrice + bus.taxes
        };
        availableBuses.push(busData);
      }
    }

    res.status(200).json({
      buses: availableBuses,
      searchCriteria: {
        origin,
        destination,
        departureDate,
        passengers,
        busType
      },
      totalResults: availableBuses.length
    });
  } catch (err) {
    next(err);
  }
};

// Get bus by ID
export const getBusById = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('route.origin', 'name code city state')
      .populate('route.destination', 'name code city state')
      .populate('route.stops.location', 'name code city');
    
    if (!bus) {
      return next(createError(404, "Bus not found!"));
    }
    
    res.status(200).json(bus);
  } catch (err) {
    next(err);
  }
};

// Get bus availability for specific date
export const getBusAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return next(createError(400, "Date is required!"));
    }

    const bus = await Bus.findById(id);
    if (!bus) {
      return next(createError(404, "Bus not found!"));
    }

    const searchDate = new Date(date);

    // Check booked seats for this date
    const bookedSeats = await TravelBooking.countDocuments({
      serviceId: bus._id,
      travelType: 'bus',
      'journey.departureDate': {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['confirmed', 'pending'] }
    });

    const availableSeats = bus.seating.totalSeats - bookedSeats;
    
    // Get available seat configuration
    const availableSeatConfig = bus.seating.seatConfiguration.filter(seat => seat.isAvailable);
    
    res.status(200).json({
      busId: id,
      date,
      totalSeats: bus.seating.totalSeats,
      bookedSeats,
      availableSeats,
      price: bus.basePrice + bus.taxes,
      isAvailable: availableSeats > 0,
      seatLayout: bus.seating.layout,
      availableSeatNumbers: availableSeatConfig.map(seat => seat.seatNumber)
    });
  } catch (err) {
    next(err);
  }
};

// Get seat map for bus
export const getBusSeatMap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return next(createError(400, "Date is required!"));
    }

    const bus = await Bus.findById(id);
    if (!bus) {
      return next(createError(404, "Bus not found!"));
    }

    const searchDate = new Date(date);

    // Get booked seat numbers for this date
    const bookedBookings = await TravelBooking.find({
      serviceId: bus._id,
      travelType: 'bus',
      'journey.departureDate': {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['confirmed', 'pending'] }
    }).select('bookingDetails.seatNumbers');

    const bookedSeatNumbers = bookedBookings.flatMap(booking => booking.bookingDetails.seatNumbers);

    // Create seat map with availability status
    const seatMap = bus.seating.seatConfiguration.map(seat => ({
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      price: seat.price,
      isAvailable: seat.isAvailable && !bookedSeatNumbers.includes(seat.seatNumber),
      isBooked: bookedSeatNumbers.includes(seat.seatNumber)
    }));

    res.status(200).json({
      busId: id,
      date,
      layout: bus.seating.layout,
      totalSeats: bus.seating.totalSeats,
      seatMap,
      basePrice: bus.basePrice,
      taxes: bus.taxes
    });
  } catch (err) {
    next(err);
  }
};

// Create bus (Admin only)
export const createBus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const bus = new Bus(req.body);
    await bus.save();
    
    res.status(201).json({
      message: "Bus created successfully!",
      bus
    });
  } catch (err) {
    next(err);
  }
};

// Update bus (Admin only)
export const updateBus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!bus) {
      return next(createError(404, "Bus not found!"));
    }
    
    res.status(200).json({
      message: "Bus updated successfully!",
      bus
    });
  } catch (err) {
    next(err);
  }
};

// Delete bus (Admin only)
export const deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    
    if (!bus) {
      return next(createError(404, "Bus not found!"));
    }
    
    res.status(200).json({
      message: "Bus deactivated successfully!"
    });
  } catch (err) {
    next(err);
  }
};

// Get all buses (Admin only)
export const getAllBuses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, busType, operator } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (busType) query.busType = busType;
    if (operator) query['operator.name'] = new RegExp(operator, 'i');
    
    const skip = (page - 1) * limit;
    
    const buses = await Bus.find(query)
      .populate('route.origin', 'name code city')
      .populate('route.destination', 'name code city')
      .sort({ 'operator.name': 1, busNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Bus.countDocuments(query);
    
    res.status(200).json({
      buses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBuses: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};
