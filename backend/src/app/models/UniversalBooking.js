import mongoose from "mongoose";

const UniversalBookingSchema = new mongoose.Schema({
  // Common fields
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bookingType: {
    type: String,
    enum: ["hotel", "flight", "train", "bus"],
    required: true
  },
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ["confirmed", "pending", "cancelled"],
    default: "confirmed"
  },
  
  // Passenger/Guest Details
  passengerDetails: {
    primaryPassenger: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      age: { type: Number },
      gender: { type: String, enum: ["male", "female", "other"] }
    },
    additionalPassengers: [{
      firstName: { type: String },
      lastName: { type: String },
      age: { type: Number },
      gender: { type: String, enum: ["male", "female", "other"] }
    }]
  },

  // Travel Details (for flights, trains, buses)
  travelDetails: {
    serviceName: String,
    route: String,
    departureTime: String,
    arrivalTime: String,
    duration: String,
    departureDate: Date,
    arrivalDate: Date,
    class: String, // For trains
    seatType: String, // For buses
    flightNumber: String, // For flights
    trainNumber: String, // For trains
    busNumber: String // For buses
  },

  // Hotel Details (for hotels)
  hotelDetails: {
    hotelName: String,
    hotelAddress: String,
    roomType: String,
    roomNumber: String,
    checkIn: Date,
    checkOut: Date,
    numberOfNights: Number,
    adults: Number,
    children: Number
  },

  // Pricing
  pricing: {
    basePrice: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 50 },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true }
  },

  // Payment Details
  payment: {
    method: {
      type: String,
      enum: ["credit_card", "debit_card", "upi", "net_banking", "wallet"],
      required: true
    },
    transactionId: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed"
    },
    paymentDate: { type: Date, default: Date.now }
  },

  // Additional Information
  specialRequests: [String],
  bookingDate: { type: Date, default: Date.now },
  
  // Service-specific data (flexible object for any additional data)
  serviceData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Generate ticket ID before saving
UniversalBookingSchema.pre('save', function(next) {
  if (!this.ticketId) {
    const prefix = this.bookingType.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketId = `${prefix}${timestamp}${random}`;
  }
  next();
});

export default mongoose.model("UniversalBooking", UniversalBookingSchema);
