import mongoose from 'mongoose';

const ChatHistorySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userInfo: {
    name: String,
    email: String,
    phone: String
  },
  messages: [{
    id: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'quick_action', 'contact_form'],
      default: 'text'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'ended', 'transferred'],
    default: 'active'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  contactSubmitted: {
    type: Boolean,
    default: false
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatContact',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ChatHistorySchema.index({ sessionId: 1, lastActivity: -1 });
ChatHistorySchema.index({ userId: 1, lastActivity: -1 });
ChatHistorySchema.index({ 'userInfo.email': 1 });
ChatHistorySchema.index({ 'userInfo.phone': 1 });
ChatHistorySchema.index({ status: 1, lastActivity: -1 });

// Update lastActivity on message addition
ChatHistorySchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  next();
});

// Virtual for message count
ChatHistorySchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Method to add message
ChatHistorySchema.methods.addMessage = function(messageData) {
  this.messages.push({
    id: messageData.id || Date.now().toString(),
    text: messageData.text,
    sender: messageData.sender,
    timestamp: messageData.timestamp || new Date(),
    messageType: messageData.messageType || 'text'
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to end chat session
ChatHistorySchema.methods.endSession = function() {
  this.status = 'ended';
  this.lastActivity = new Date();
  return this.save();
};

// Static method to find or create session
ChatHistorySchema.statics.findOrCreateSession = async function(sessionId, userInfo = null) {
  let session = await this.findOne({ sessionId, status: 'active' });
  
  if (!session) {
    session = new this({
      sessionId,
      userInfo,
      messages: [],
      status: 'active'
    });
    await session.save();
  } else if (userInfo && !session.userInfo.email) {
    // Update user info if not already set
    session.userInfo = userInfo;
    await session.save();
  }
  
  return session;
};

// Static method to get recent sessions for a user
ChatHistorySchema.statics.getRecentSessions = async function(userIdentifier, limit = 10) {
  const query = {
    $or: [
      { 'userInfo.email': userIdentifier },
      { 'userInfo.phone': userIdentifier },
      { sessionId: userIdentifier }
    ]
  };
  
  return this.find(query)
    .sort({ lastActivity: -1 })
    .limit(limit)
    .select('sessionId userInfo messages status lastActivity createdAt');
};

export default mongoose.model('ChatHistory', ChatHistorySchema);
