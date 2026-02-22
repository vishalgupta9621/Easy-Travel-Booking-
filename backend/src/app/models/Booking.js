// models/Booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true
  },

  bookingType: {
    type: String,
    enum: ["hotel", "flight", "train", "bus", "package"],
    required: true
  },

  // Linked item (Hotel, Flight, etc.)
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "bookingTypeRef"
  },
  bookingTypeRef: {
    type: String,
    enum: ["Hotel", "Flight", "Train", "Bus", "Package"]
  },

  // Full item details snapshot at booking time
  itemDetails: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // User details
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // guest allowed
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

  // Payment info
  paymentInfo: {
    paymentId: { type: String, required: true },
    orderId: String,
    signature: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending"
    },
    timestamp: { type: Date, default: Date.now }
  },

  bookingStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed", "refunded"],
    default: "confirmed"
  },

  totalAmount: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },

  // Common travel dates
  travelDate: { type: Date },
  returnDate: { type: Date },

  // Passengers (for flights/trains/bus/packages)
  passengers: [{
    name: String,
    age: Number,
    gender: String,
    seatNumber: String
  }],

  // Hotel-specific details (only for bookingType = hotel)
  hotelBooking: {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    roomNumber: Number,
    checkIn: Date,
    checkOut: Date,
    adults: Number,
    children: Number,
    pricing: {
      roomPrice: Number,
      taxes: Number,
      serviceFee: Number,
      discount: Number,
      totalPrice: Number
    },
    specialRequests: [String]
  },

  // Additional info
  specialRequests: String,
  cancellationPolicy: String,
  refundAmount: { type: Number, default: 0 },
  notes: String,

  // Email tracking
  emailSent: { type: Boolean, default: false }

}, { timestamps: true });

// Indexes
BookingSchema.index({ bookingNumber: 1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ bookingType: 1 });
BookingSchema.index({ bookingStatus: 1 });
BookingSchema.index({ bookingDate: 1 });

// Auto-generate booking number
BookingSchema.pre("save", function(next) {
  if (!this.bookingNumber) {
    this.bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export default mongoose.model("Booking", BookingSchema);
