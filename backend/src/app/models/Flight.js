import mongoose from "mongoose";

const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  airline: {
    name: { type: String, required: true },
    code: { type: String, required: true }, // e.g., AI, 6E, SG
    logo: { type: String }
  },
  aircraft: {
    model: { type: String, default: "Boeing 737" },
    capacity: { type: Number, required: true, default: 180 }
  },
  route: {
    origin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      validate: {
        validator: function(v) {
          return v && v.toString().length > 0;
        },
        message: 'Origin is required'
      }
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      validate: {
        validator: function(v) {
          return v && v.toString().length > 0;
        },
        message: 'Destination is required'
      }
    },
    stops: [{
      destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
      arrivalTime: { type: Date },
      departureTime: { type: Date },
      duration: { type: Number } // in minutes
    }]
  },
  schedule: {
    departureTime: { type: String, required: true, default: "09:00" }, // Format: "HH:MM"
    arrivalTime: { type: String, required: true, default: "11:00" },
    duration: { type: Number, required: true, default: 120 }, // in minutes
    frequency: { type: String, enum: ['daily', 'weekly', 'specific_dates'], default: 'daily' },
    operatingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    validFrom: { type: Date, required: true, default: Date.now },
    validTo: { type: Date, required: true, default: () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }}
  },
  pricing: {
    economy: {
      basePrice: { type: Number, required: true },
      taxes: { type: Number, default: 0 },
      totalSeats: { type: Number, required: true, default: 150 },
      availableSeats: { type: Number, default: function() { return this.totalSeats || 150; } }
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
