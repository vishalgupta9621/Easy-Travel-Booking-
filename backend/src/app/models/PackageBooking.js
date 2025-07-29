import mongoose from "mongoose";

const PackageBookingSchema = new mongoose.Schema({
  // Basic booking information
  bookingNumber: {
    type: String,
    unique: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // For guest bookings
  },
  
  // Customer information
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
  
  // Travel details
  travelDetails: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    numberOfTravelers: { type: Number, required: true, min: 1 },
    travelers: [{
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      idType: { type: String, enum: ['passport', 'aadhar', 'driving_license'] },
      idNumber: { type: String }
    }]
  },
  
  // Selected preferences for dynamic booking
  selectedPreferences: {
    hotelCategory: { 
      type: String, 
      enum: ['budget', 'standard', 'luxury'], 
      required: true 
    },
    transportType: { 
      type: String, 
      enum: ['flight', 'train', 'bus'], 
      required: true 
    },
    transportClass: { type: String }, // Depends on transport type
    addOns: [{
      name: { type: String },
      price: { type: Number }
    }]
  },
  
  // Dynamic pricing breakdown
  pricingBreakdown: {
    basePackagePrice: { type: Number, required: true },
    hotelPrice: { type: Number, required: true },
    transportPrice: { type: Number, required: true },
    addOnsPrice: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  
  // Booking status and payment
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  
  paymentInfo: {
    paymentId: { type: String },
    orderId: String,
    signature: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'success', 'failed', 'refunded'], 
      default: 'pending' 
    },
    timestamp: { type: Date, default: Date.now }
  },
  
  // Additional information
  specialRequests: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },
  
  // Booking metadata
  bookingDate: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
  source: { type: String, enum: ['web', 'mobile', 'admin'], default: 'web' },
  
  // Cancellation and refund
  cancellationDetails: {
    cancelledAt: { type: Date },
    cancelledBy: { type: String },
    reason: { type: String },
    refundAmount: { type: Number, default: 0 },
    refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] }
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
PackageBookingSchema.index({ bookingNumber: 1 });
PackageBookingSchema.index({ packageId: 1 });
PackageBookingSchema.index({ userId: 1 });
PackageBookingSchema.index({ bookingStatus: 1 });
PackageBookingSchema.index({ 'travelDetails.startDate': 1 });
PackageBookingSchema.index({ 'customerInfo.email': 1 });

// Generate booking number before saving
PackageBookingSchema.pre('save', function(next) {
  if (!this.bookingNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingNumber = `PKG${timestamp.slice(-6)}${random}`;
  }
  this.lastModified = new Date();
  next();
});

// Calculate total amount before saving
PackageBookingSchema.pre('save', function(next) {
  if (this.pricingBreakdown) {
    const breakdown = this.pricingBreakdown;
    this.pricingBreakdown.totalAmount = 
      breakdown.basePackagePrice + 
      breakdown.hotelPrice + 
      breakdown.transportPrice + 
      breakdown.addOnsPrice + 
      breakdown.taxes + 
      breakdown.serviceFee - 
      breakdown.discount;
    
    this.paymentInfo.amount = this.pricingBreakdown.totalAmount;
  }
  next();
});

export default mongoose.model("PackageBooking", PackageBookingSchema);
