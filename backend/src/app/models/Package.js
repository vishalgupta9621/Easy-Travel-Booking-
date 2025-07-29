import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // in days
  destinations: [{ type: String }],
  type: {
    type: String,
    enum: ['adventure', 'leisure', 'business', 'family', 'honeymoon', 'pilgrimage'],
    required: true
  },
  basePrice: { type: Number, required: true }, // Base package price

  // Dynamic pricing structure
  pricing: {
    basePackagePrice: { type: Number },
    hotelOptions: [{
      category: { type: String, enum: ['budget', 'standard', 'luxury'], required: true },
      pricePerNight: { type: Number, required: true },
      description: { type: String }
    }],
    transportOptions: [{
      type: { type: String, enum: ['flight', 'train', 'bus'], required: true },
      class: { type: String }, // economy, business, first for flights; SL, 3A, 2A for trains; ac, non-ac for buses
      basePrice: { type: Number, required: true },
      description: { type: String }
    }]
  },

  // Package preferences and inclusions
  preferences: {
    recommendedTransport: [{ type: String, enum: ['flight', 'train', 'bus'] }],
    recommendedHotelCategory: { type: String, enum: ['budget', 'standard', 'luxury'], default: 'standard' },
    includedMeals: [{ type: String, enum: ['breakfast', 'lunch', 'dinner'] }],
    includedActivities: [{ type: String }],
    optionalAddOns: [{
      name: { type: String },
      price: { type: Number },
      description: { type: String }
    }]
  },

  // Legacy price field for backward compatibility
  price: { type: Number, required: true },

  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  itinerary: [{
    day: { type: Number },
    title: { type: String },
    description: { type: String },
    activities: [{ type: String }]
  }],
  images: [{ type: String }],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  maxGroupSize: { type: Number, default: 10 },
  minAge: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'difficult'],
    default: 'easy'
  },
  startDates: [{ type: Date }],
  endDates: [{ type: Date }],
  availableSlots: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for better search performance
PackageSchema.index({ name: 1 });
PackageSchema.index({ type: 1 });
PackageSchema.index({ price: 1 });
PackageSchema.index({ rating: 1 });
PackageSchema.index({ isActive: 1 });

export default mongoose.model("Package", PackageSchema);
