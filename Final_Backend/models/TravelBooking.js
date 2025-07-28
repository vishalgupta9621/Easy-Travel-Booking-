import mongoose from "mongoose";

const TravelBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  travelType: { type: String, enum: ['flight', 'train', 'bus'], required: true },
  
  // Reference to the specific travel service
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'travelType' // Dynamic reference based on travelType
  },
  
  // Journey details
  journey: {
    origin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Destination', 
      required: true 
    },
    destination: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Destination', 
      required: true 
    },
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true }
  },
  
  // Passenger details
  passengers: [{
    title: { type: String, enum: ['Mr', 'Ms', 'Mrs', 'Dr'], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    seatNumber: { type: String },
    seatPreference: { type: String, enum: ['window', 'aisle', 'middle'] },
    specialRequests: [{ type: String }],
    identityProof: {
      type: { type: String, enum: ['aadhar', 'passport', 'driving_license', 'voter_id'] },
      number: { type: String }
    }
  }],
  
  // Booking details specific to travel type
  bookingDetails: {
    // For flights
    class: { type: String }, // economy, business, first
    
    // For trains
    trainClass: { type: String }, // SL, 3A, 2A, 1A, CC, EC
    coach: { type: String },
    
    // For buses
    busType: { type: String }, // ac_sleeper, non_ac_sleeper, etc.
    
    // Common
    seatNumbers: [{ type: String }],
    totalSeats: { type: Number, required: true }
  },
  
  // Pricing
  pricing: {
    basePrice: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  
  // Payment details
  payment: {
    method: { type: String, enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'], required: true },
    transactionId: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paymentDate: { type: Date },
    refundAmount: { type: Number, default: 0 },
    refundDate: { type: Date }
  },
  
  // Booking status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'], 
    default: 'pending' 
  },
  
  // Contact details
  contact: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    emergencyContact: {
      name: { type: String },
      phone: { type: String }
    }
  },
  
  // Additional services
  addOns: [{
    service: { type: String }, // meal, insurance, extra_baggage
    price: { type: Number },
    description: { type: String }
  }],
  
  // Cancellation details
  cancellation: {
    isCancellable: { type: Boolean, default: true },
    cancellationCharges: { type: Number, default: 0 },
    cancellationDate: { type: Date },
    cancellationReason: { type: String },
    refundEligible: { type: Boolean, default: true }
  },
  
  // Timestamps
  bookingDate: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for efficient queries
TravelBookingSchema.index({ bookingId: 1 });
TravelBookingSchema.index({ userId: 1 });
TravelBookingSchema.index({ travelType: 1 });
TravelBookingSchema.index({ status: 1 });
TravelBookingSchema.index({ 'journey.departureDate': 1 });
TravelBookingSchema.index({ 'payment.paymentStatus': 1 });

// Pre-save middleware to generate booking ID
TravelBookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const prefix = this.travelType.toUpperCase().charAt(0);
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingId = `${prefix}${timestamp}${random}`;
  }
  this.lastModified = new Date();
  next();
});

export default mongoose.model("TravelBooking", TravelBookingSchema);
