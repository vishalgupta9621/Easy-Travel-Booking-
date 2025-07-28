import mongoose from "mongoose";
import TravelBooking from "../models/TravelBooking.js";
import Flight from "../models/Flight.js";
import Train from "../models/Train.js";
import Bus from "../models/Bus.js";
import User from "../models/User.js";
import { createError } from "../utils/error.js";
import { validationResult } from "express-validator";

// Helper function to get service model based on travel type
const getServiceModel = (travelType) => {
  switch (travelType) {
    case 'flight': return Flight;
    case 'train': return Train;
    case 'bus': return Bus;
    default: throw new Error('Invalid travel type');
  }
};

// Create travel booking
export const createTravelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      return next(createError(400, errors.array()[0].msg));
    }

    const {
      travelType,
      serviceId,
      journey,
      passengers,
      bookingDetails,
      contact,
      payment,
      addOns = []
    } = req.body;

    // Validate travel type
    if (!['flight', 'train', 'bus'].includes(travelType)) {
      await session.abortTransaction();
      return next(createError(400, "Invalid travel type!"));
    }

    // Get service model and validate service exists
    const ServiceModel = getServiceModel(travelType);
    const service = await ServiceModel.findById(serviceId).session(session);
    
    if (!service) {
      await session.abortTransaction();
      return next(createError(404, `${travelType} not found!`));
    }

    // Validate journey dates
    const departureDate = new Date(journey.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (departureDate < today) {
      await session.abortTransaction();
      return next(createError(400, "Departure date cannot be in the past!"));
    }

    // Check availability based on travel type
    let availabilityCheck = false;
    let pricing = { basePrice: 0, taxes: 0, serviceFee: 50, discount: 0 };

    if (travelType === 'flight') {
      const classInfo = service.pricing[bookingDetails.class];
      if (!classInfo) {
        await session.abortTransaction();
        return next(createError(400, "Invalid flight class!"));
      }

      // Check available seats
      const bookedSeats = await TravelBooking.countDocuments({
        serviceId: service._id,
        travelType: 'flight',
        'journey.departureDate': {
          $gte: new Date(departureDate.setHours(0, 0, 0, 0)),
          $lt: new Date(departureDate.setHours(23, 59, 59, 999))
        },
        status: { $in: ['confirmed', 'pending'] }
      }).session(session);

      const availableSeats = classInfo.totalSeats - bookedSeats;
      availabilityCheck = availableSeats >= passengers.length;
      
      pricing.basePrice = classInfo.basePrice * passengers.length;
      pricing.taxes = classInfo.taxes * passengers.length;
    }
    
    else if (travelType === 'train') {
      const classInfo = service.classes.find(c => c.code === bookingDetails.trainClass);
      if (!classInfo) {
        await session.abortTransaction();
        return next(createError(400, "Invalid train class!"));
      }

      // Check available seats
      const bookedSeats = await TravelBooking.countDocuments({
        serviceId: service._id,
        travelType: 'train',
        'journey.departureDate': {
          $gte: new Date(departureDate.setHours(0, 0, 0, 0)),
          $lt: new Date(departureDate.setHours(23, 59, 59, 999))
        },
        'bookingDetails.trainClass': bookingDetails.trainClass,
        status: { $in: ['confirmed', 'pending'] }
      }).session(session);

      const availableSeats = classInfo.totalSeats - bookedSeats;
      availabilityCheck = availableSeats >= passengers.length;
      
      pricing.basePrice = classInfo.basePrice * passengers.length;
    }
    
    else if (travelType === 'bus') {
      // Check available seats
      const bookedSeats = await TravelBooking.countDocuments({
        serviceId: service._id,
        travelType: 'bus',
        'journey.departureDate': {
          $gte: new Date(departureDate.setHours(0, 0, 0, 0)),
          $lt: new Date(departureDate.setHours(23, 59, 59, 999))
        },
        status: { $in: ['confirmed', 'pending'] }
      }).session(session);

      const availableSeats = service.seating.totalSeats - bookedSeats;
      availabilityCheck = availableSeats >= passengers.length;
      
      pricing.basePrice = service.basePrice * passengers.length;
      pricing.taxes = service.taxes * passengers.length;
    }

    if (!availabilityCheck) {
      await session.abortTransaction();
      return next(createError(409, "Not enough seats available!"));
    }

    // Calculate add-ons cost
    const addOnsCost = addOns.reduce((total, addon) => total + (addon.price || 0), 0);
    
    // Calculate total amount
    pricing.totalAmount = pricing.basePrice + pricing.taxes + pricing.serviceFee + addOnsCost - pricing.discount;

    // Create booking
    const booking = new TravelBooking({
      userId: req.user.id,
      travelType,
      serviceId,
      journey,
      passengers,
      bookingDetails: {
        ...bookingDetails,
        totalSeats: passengers.length
      },
      pricing,
      payment: {
        ...payment,
        paymentStatus: 'pending'
      },
      contact,
      addOns,
      status: 'pending'
    });

    const savedBooking = await booking.save({ session });

    // Update user loyalty points
    const pointsEarned = Math.floor(pricing.totalAmount / 100);
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { loyaltyPoints: pointsEarned } },
      { session }
    );

    await session.commitTransaction();

    // Populate the booking with service and destination details
    const populatedBooking = await TravelBooking.findById(savedBooking._id)
      .populate('userId', 'firstName lastName email phone')
      .populate('journey.origin', 'name code city')
      .populate('journey.destination', 'name code city');

    res.status(201).json({
      message: "Booking created successfully!",
      booking: populatedBooking,
      pointsEarned
    });

  } catch (err) {
    await session.abortTransaction();
    console.error('Travel booking creation failed:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
      user: req.user?.id
    });
    next(createError(500, "Failed to create booking. Please try again."));
  } finally {
    session.endSession();
  }
};

// Get user's travel bookings
export const getUserTravelBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, travelType } = req.query;
    
    let query = { userId: req.user.id };
    if (status) query.status = status;
    if (travelType) query.travelType = travelType;
    
    const skip = (page - 1) * limit;
    
    const bookings = await TravelBooking.find(query)
      .populate('journey.origin', 'name code city')
      .populate('journey.destination', 'name code city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await TravelBooking.countDocuments(query);
    
    res.status(200).json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get booking by ID
export const getTravelBookingById = async (req, res, next) => {
  try {
    const booking = await TravelBooking.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .populate('journey.origin', 'name code city state')
      .populate('journey.destination', 'name code city state');
    
    if (!booking) {
      return next(createError(404, "Booking not found!"));
    }
    
    // Check if user owns this booking or is admin
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(createError(403, "Access denied!"));
    }
    
    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

// Cancel travel booking
export const cancelTravelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cancellationReason } = req.body;
    
    const booking = await TravelBooking.findById(req.params.id).session(session);
    
    if (!booking) {
      await session.abortTransaction();
      return next(createError(404, "Booking not found!"));
    }
    
    // Check if user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      await session.abortTransaction();
      return next(createError(403, "Access denied!"));
    }
    
    // Check if booking can be cancelled
    if (!booking.cancellation.isCancellable || booking.status === 'cancelled') {
      await session.abortTransaction();
      return next(createError(400, "Booking cannot be cancelled!"));
    }
    
    // Calculate cancellation charges based on time remaining
    const now = new Date();
    const departureDate = new Date(booking.journey.departureDate);
    const hoursUntilDeparture = (departureDate - now) / (1000 * 60 * 60);
    
    let cancellationCharges = 0;
    let refundAmount = booking.pricing.totalAmount;
    
    // Apply cancellation policy (simplified)
    if (hoursUntilDeparture < 2) {
      cancellationCharges = booking.pricing.totalAmount; // No refund
      refundAmount = 0;
    } else if (hoursUntilDeparture < 24) {
      cancellationCharges = booking.pricing.totalAmount * 0.5; // 50% charges
      refundAmount = booking.pricing.totalAmount * 0.5;
    } else if (hoursUntilDeparture < 72) {
      cancellationCharges = booking.pricing.totalAmount * 0.25; // 25% charges
      refundAmount = booking.pricing.totalAmount * 0.75;
    } else {
      cancellationCharges = 100; // Flat ₹100 charges
      refundAmount = booking.pricing.totalAmount - 100;
    }
    
    // Update booking
    booking.status = 'cancelled';
    booking.cancellation.cancellationDate = now;
    booking.cancellation.cancellationReason = cancellationReason;
    booking.cancellation.cancellationCharges = cancellationCharges;
    booking.payment.refundAmount = refundAmount;
    
    if (refundAmount > 0) {
      booking.payment.paymentStatus = 'refunded';
    }
    
    await booking.save({ session });
    
    await session.commitTransaction();
    
    res.status(200).json({
      message: "Booking cancelled successfully!",
      cancellationCharges,
      refundAmount,
      booking
    });
    
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// Get all bookings (Admin only)
export const getAllTravelBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, travelType, userId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (travelType) query.travelType = travelType;
    if (userId) query.userId = userId;
    
    const skip = (page - 1) * limit;
    
    const bookings = await TravelBooking.find(query)
      .populate('userId', 'firstName lastName email phone')
      .populate('journey.origin', 'name code city')
      .populate('journey.destination', 'name code city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await TravelBooking.countDocuments(query);
    
    res.status(200).json({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};
