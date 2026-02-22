import ChatHistory from '../models/ChatHistory.js';
import ChatContact from '../models/ChatContact.js';

// Save chat message
export const saveChatMessage = async (req, res) => {
  try {
    const { sessionId, message, userInfo } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }

    // Find or create chat session
    const session = await ChatHistory.findOrCreateSession(sessionId, userInfo);

    // Add message to session
    await session.addMessage({
      id: message.id || Date.now().toString(),
      text: message.text,
      sender: message.sender,
      timestamp: message.timestamp || new Date(),
      messageType: message.messageType || 'text'
    });

    res.json({
      success: true,
      data: session,
      message: 'Message saved successfully'
    });

  } catch (error) {
    console.error('Save chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save chat message',
      error: error.message
    });
  }
};

// Get chat history for a session
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const session = await ChatHistory.findOne({ sessionId })
      .populate('contactId', 'status priority notes');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: session,
      message: 'Chat history retrieved successfully'
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: error.message
    });
  }
};

// Get recent chat sessions for a user
export const getRecentSessions = async (req, res) => {
  try {
    const { userIdentifier } = req.params;
    const { limit = 10 } = req.query;

    if (!userIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'User identifier is required'
      });
    }

    const sessions = await ChatHistory.getRecentSessions(userIdentifier, parseInt(limit));

    res.json({
      success: true,
      data: sessions,
      message: 'Recent sessions retrieved successfully'
    });

  } catch (error) {
    console.error('Get recent sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent sessions',
      error: error.message
    });
  }
};

// Link chat session to contact
export const linkChatToContact = async (req, res) => {
  try {
    const { sessionId, contactId } = req.body;

    if (!sessionId || !contactId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and Contact ID are required'
      });
    }

    // Update chat session
    const session = await ChatHistory.findOneAndUpdate(
      { sessionId },
      { 
        contactId,
        contactSubmitted: true,
        status: 'transferred'
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Update contact with chat history reference
    await ChatContact.findByIdAndUpdate(contactId, {
      $set: {
        chatSessionId: sessionId,
        'notes.0': {
          text: `Chat session linked: ${session.messages.length} messages exchanged`,
          addedAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: session,
      message: 'Chat session linked to contact successfully'
    });

  } catch (error) {
    console.error('Link chat to contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link chat to contact',
      error: error.message
    });
  }
};

// End chat session
export const endChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const session = await ChatHistory.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    await session.endSession();

    res.json({
      success: true,
      data: session,
      message: 'Chat session ended successfully'
    });

  } catch (error) {
    console.error('End chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end chat session',
      error: error.message
    });
  }
};

// Get all chat sessions (admin)
export const getAllChatSessions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      sortBy = 'lastActivity',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const sessions = await ChatHistory.find(query)
      .populate('contactId', 'status priority')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('sessionId userInfo status lastActivity messageCount contactSubmitted createdAt');

    const total = await ChatHistory.countDocuments(query);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      },
      message: 'Chat sessions retrieved successfully'
    });

  } catch (error) {
    console.error('Get all chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat sessions',
      error: error.message
    });
  }
};
