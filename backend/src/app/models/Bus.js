import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  busNumber: { type: String, required: true },
  operator: {
    name: { type: String, required: true },
    code: { type: String, required: true },
    logo: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    contact: {
      phone: { type: String },
      email: { type: String }
    }
  },
  busType: { 
    type: String, 
    enum: ['ac_sleeper', 'non_ac_sleeper', 'ac_seater', 'non_ac_seater', 'volvo', 'luxury'], 
    required: true 
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
      location: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
      arrivalTime: { type: String },
      departureTime: { type: String },
      distance: { type: Number } // from origin in km
    }]
  },
  schedule: {
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true }, // Format: "HH:MM"
    frequency: { type: String, enum: ['daily', 'weekly', 'specific_days'], default: 'daily' },
    operatingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true }
  },
  seating: {
    totalSeats: { type: Number, required: true, default: 40 },
    layout: { type: String, default: "2+2" }, // e.g., "2+2", "2+1"
    seatConfiguration: {
      type: [{
        seatNumber: { type: String, required: true },
        seatType: { type: String, enum: ['window', 'aisle', 'middle'], default: 'window' },
        isAvailable: { type: Boolean, default: true },
        price: { type: Number, required: true, default: 500 }
      }],
      default: []
    }
  },
  amenities: [{
    name: { type: String },
    description: { type: String },
    isComplimentary: { type: Boolean, default: true }
  }],
  policies: {
    cancellation: {
      rules: [{ type: String }],
      charges: [{
        timeBeforeDeparture: { type: Number }, // hours
        chargePercentage: { type: Number }
      }]
    },
    baggage: { type: String },
    boarding: { type: String }
  },
  basePrice: { type: Number, required: true },
  taxes: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviews: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for efficient queries
BusSchema.index({ busNumber: 1 });
BusSchema.index({ 'route.origin': 1, 'route.destination': 1 });
BusSchema.index({ busType: 1 });
BusSchema.index({ 'operator.name': 1 });
BusSchema.index({ status: 1 });
BusSchema.index({ 'schedule.validFrom': 1, 'schedule.validTo': 1 });

export default mongoose.model("Bus", BusSchema);
