import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true
  },
  bookingType: { 
    type: String, 
    enum: ['hotel', 'flight', 'train', 'bus', 'package'], 
    required: true 
  },
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  itemDetails: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // For guest bookings
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  paymentInfo: {
    paymentId: { type: String, required: true },
    orderId: String,
    signature: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'success', 'failed', 'refunded'], 
      default: 'pending' 
    },
    timestamp: { type: Date, default: Date.now }
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'confirmed'
  },
  totalAmount: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  travelDate: { type: Date },
  returnDate: { type: Date },
  passengers: [{
    name: String,
    age: Number,
    gender: String,
    seatNumber: String
  }],
  specialRequests: String,
  cancellationPolicy: String,
  refundAmount: { type: Number, default: 0 },
  notes: String
}, { 
  timestamps: true 
});

// Indexes for better query performance
BookingSchema.index({ bookingNumber: 1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ bookingType: 1 });
BookingSchema.index({ bookingStatus: 1 });
BookingSchema.index({ bookingDate: 1 });

// Generate booking number before saving
BookingSchema.pre('save', function(next) {
  if (!this.bookingNumber) {
    this.bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export default mongoose.model("Booking", BookingSchema);
