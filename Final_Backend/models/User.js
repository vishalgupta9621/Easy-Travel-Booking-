import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'India' }
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  profilePicture: { type: String },
  preferences: {
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  loyaltyPoints: { type: Number, default: 0 },
  lastLogin: { type: Date },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ phone: 1 });

export default mongoose.model("User", UserSchema);
