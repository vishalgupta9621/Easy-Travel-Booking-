import mongoose from "mongoose";

const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  airline: {
    name: { type: String, required: true },
    code: { type: String, required: true }, // e.g., AI, 6E, SG
    logo: { type: String }
  },
  aircraft: {
    model: { type: String },
    capacity: { type: Number, required: true }
  },
  route: {
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
    stops: [{
      destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
      arrivalTime: { type: Date },
      departureTime: { type: Date },
      duration: { type: Number } // in minutes
    }]
  },
  schedule: {
    departureTime: { type: String, required: true }, // Format: "HH:MM"
    arrivalTime: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    frequency: { type: String, enum: ['daily', 'weekly', 'specific_dates'], default: 'daily' },
    operatingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true }
  },
  pricing: {
    economy: {
      basePrice: { type: Number, required: true },
      taxes: { type: Number, default: 0 },
      totalSeats: { type: Number, required: true }
    },
    business: {
      basePrice: { type: Number },
      taxes: { type: Number, default: 0 },
      totalSeats: { type: Number, default: 0 }
    },
    first: {
      basePrice: { type: Number },
      taxes: { type: Number, default: 0 },
      totalSeats: { type: Number, default: 0 }
    }
  },
  amenities: [{
    name: { type: String },
    description: { type: String },
    isComplimentary: { type: Boolean, default: true }
  }],
  baggage: {
    cabin: { type: String, default: '7 kg' },
    checkedIn: { type: String, default: '15 kg' }
  },
  status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
  isRefundable: { type: Boolean, default: true },
  cancellationPolicy: { type: String }
}, { timestamps: true });

// Indexes for efficient queries
FlightSchema.index({ flightNumber: 1 });
FlightSchema.index({ 'route.origin': 1, 'route.destination': 1 });
FlightSchema.index({ 'airline.code': 1 });
FlightSchema.index({ status: 1 });
FlightSchema.index({ 'schedule.validFrom': 1, 'schedule.validTo': 1 });

export default mongoose.model("Flight", FlightSchema);
