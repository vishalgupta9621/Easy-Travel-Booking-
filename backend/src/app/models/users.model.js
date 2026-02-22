import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: ""
  },
  documentNumber: {
    type: String,
    required: false,
  },
  verified: {
    type: Boolean,
    default: false,
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  firstName: {
    type: String,
    default: "",
    trim: true,
  },

  lastName: {
    type: String,
    default: "",
    trim: true,
  },

  email: {
    type: String,
    required: false,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address"
    ]
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[0-9]{10,15}$/,
      "Please enter a valid mobile number (10-15 digits)"
    ]
  },

  age: {
    type: Number,
    min: 0,
    required: false,
  },

  birthDate: {
    type: Date,
    required: false,
  },

  address: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },

  documents: {
    type: [DocumentSchema],
    default: []
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
  },

  is_verified: {
    type: Boolean,
    default: false,
  },

  // Password reset fields
  resetPasswordToken: {
    type: String,
    default: null,
  },

  resetPasswordExpires: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
