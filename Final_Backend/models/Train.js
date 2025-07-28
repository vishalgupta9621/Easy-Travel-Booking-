import mongoose from "mongoose";

const TrainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: { type: String, required: true },
  trainType: { type: String, enum: ['express', 'superfast', 'passenger', 'local', 'rajdhani', 'shatabdi', 'duronto'], required: true },
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
    stations: [{
      station: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
      arrivalTime: { type: String }, // Format: "HH:MM"
      departureTime: { type: String },
      distance: { type: Number }, // from origin in km
      day: { type: Number, default: 1 }, // day of journey
      platform: { type: String }
    }]
  },
  schedule: {
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true }, // Format: "HH:MM"
    frequency: { type: String, enum: ['daily', 'weekly', 'bi_weekly', 'specific_days'], default: 'daily' },
    operatingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true }
  },
  classes: [{
    name: { type: String, required: true }, // SL, 3A, 2A, 1A, CC, EC
    code: { type: String, required: true },
    basePrice: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    amenities: [{ type: String }],
    description: { type: String }
  }],
  amenities: [{
    name: { type: String },
    description: { type: String },
    isComplimentary: { type: Boolean, default: true }
  }],
  pantryAvailable: { type: Boolean, default: false },
  wifiAvailable: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
  cancellationPolicy: {
    rules: [{ type: String }],
    charges: [{
      timeBeforeDeparture: { type: Number }, // hours
      chargePercentage: { type: Number }
    }]
  }
}, { timestamps: true });

// Indexes for efficient queries
TrainSchema.index({ trainNumber: 1 });
TrainSchema.index({ 'route.origin': 1, 'route.destination': 1 });
TrainSchema.index({ trainType: 1 });
TrainSchema.index({ status: 1 });
TrainSchema.index({ 'schedule.validFrom': 1, 'schedule.validTo': 1 });

export default mongoose.model("Train", TrainSchema);
