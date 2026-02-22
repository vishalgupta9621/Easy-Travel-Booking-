import mongoose from 'mongoose';

const ChatContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  message: {
    type: String,
    default: 'Contact request from chatbot'
  },
  source: {
    type: String,
    default: 'chatbot'
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'resolved'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  contactedAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  chatSessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ChatContactSchema.index({ email: 1 });
ChatContactSchema.index({ phone: 1 });
ChatContactSchema.index({ status: 1 });
ChatContactSchema.index({ createdAt: -1 });
ChatContactSchema.index({ priority: 1, status: 1 });

// Virtual for full contact info
ChatContactSchema.virtual('fullContactInfo').get(function() {
  return `${this.name} - ${this.email} - ${this.phone}`;
});

// Method to mark as contacted
ChatContactSchema.methods.markAsContacted = function(userId) {
  this.status = 'contacted';
  this.contactedAt = new Date();
  if (userId) {
    this.assignedTo = userId;
  }
  return this.save();
};

// Method to mark as resolved
ChatContactSchema.methods.markAsResolved = function(userId) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  if (userId) {
    this.assignedTo = userId;
  }
  return this.save();
};

// Method to add note
ChatContactSchema.methods.addNote = function(text, userId) {
  this.notes.push({
    text: text,
    addedBy: userId,
    addedAt: new Date()
  });
  return this.save();
};

// Static method to get pending contacts
ChatContactSchema.statics.getPendingContacts = function() {
  return this.find({ status: 'pending' })
    .sort({ priority: -1, createdAt: -1 })
    .populate('assignedTo', 'name email');
};

// Static method to get contacts by status
ChatContactSchema.statics.getContactsByStatus = function(status) {
  return this.find({ status: status })
    .sort({ createdAt: -1 })
    .populate('assignedTo', 'name email');
};

export default mongoose.model('ChatContact', ChatContactSchema);
