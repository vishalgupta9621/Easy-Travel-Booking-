import mongoose from "mongoose";

const DestinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // Airport/Station code (e.g., DEL, BOM)
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  type: { type: String, enum: ['airport', 'railway_station', 'bus_station'], required: true },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  timezone: { type: String },
  isActive: { type: Boolean, default: true },
  facilities: [{
    name: { type: String },
    description: { type: String }
  }],
  images: [{ type: String }],
  description: { type: String }
}, { timestamps: true });

// Indexes for better search performance
DestinationSchema.index({ code: 1 });
DestinationSchema.index({ city: 1 });
DestinationSchema.index({ type: 1 });
DestinationSchema.index({ isActive: 1 });

export default mongoose.model("Destination", DestinationSchema);
