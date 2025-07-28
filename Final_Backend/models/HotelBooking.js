// models/HotelBooking.js - Specific to hotel bookings
import mongoose from 'mongoose';

const HotelBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomId: { // This now refers to the Room TYPE (e.g., Deluxe King Room)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  roomNumber: { // This is the specific physical room number booked
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guestDetails: {
    primaryGuest: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    additionalGuests: [{
      firstName: { type: String },
      lastName: { type: String },
      age: { type: Number }
    }]
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  adults: {
    type: Number,
    required: true
  },
  children: {
    type: Number,
    default: 0
  },
  pricing: {
    roomPrice: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true }
  },
  payment: {
    method: { type: String, enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'], required: true },
    transactionId: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'checked_in', 'checked_out'],
    default: 'pending'
  },
  specialRequests: [{ type: String }],
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware to generate booking ID
HotelBookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingId = `H${timestamp}${random}`;
  }
  next();
});

// Indexes for efficient queries
HotelBookingSchema.index({ bookingId: 1 });
HotelBookingSchema.index({ userId: 1 });
HotelBookingSchema.index({ hotelId: 1 });
HotelBookingSchema.index({ status: 1 });
HotelBookingSchema.index({ checkIn: 1, checkOut: 1 });

export default mongoose.model('HotelBooking', HotelBookingSchema);
