import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    default: ""
  }
}, { _id: false });

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String, 
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  distance: {
    type: String,
    required: true,
    trim: true
  },
  photos: {
    type: [PhotoSchema],
    default: [{
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60",
      index: 0,
      label: "Default hotel image"
    }]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return v === null || v === '' || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    },
    default: null
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return v === null || v === '' || /^[0-9]{10,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    default: null
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    set: v => parseFloat(v) || 0 // Convert string to number
  },
  rooms: {
    type: [String],
    default: []
  },
  cheapestPrice: {
    type: Number,
    required: true,
    min: 0,
    set: v => parseFloat(v) || 0 // Convert string to number
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, { 
  timestamps: true 
});

HotelSchema.index({
  name: 'text',
  city: 'text',
  address: 'text',
  title: 'text',
  desc: 'text'
});

export default mongoose.model("Hotel", HotelSchema);