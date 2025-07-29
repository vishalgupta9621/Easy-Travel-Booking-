import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  bookingNumber: {
    type: String,
    required: true,
    ref: 'Booking'
  },
  orderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  method: {
    type: String,
    enum: ['demo', 'upi', 'card', 'netbanking', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  signature: {
    type: String
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  paymentDetails: {
    gateway: String,
    transactionId: String,
    bankReference: String,
    upiId: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
PaymentSchema.index({ bookingNumber: 1 });
PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ method: 1 });

export default mongoose.model('Payment', PaymentSchema);
