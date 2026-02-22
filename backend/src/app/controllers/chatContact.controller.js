import ChatContact from '../models/ChatContact.js';

// Create new chat contact
export const createChatContact = async (req, res) => {
  try {
    const { name, email, phone, message, chatSessionId } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required'
      });
    }

    // Check if contact already exists (within last 24 hours)
    const existingContact = await ChatContact.findOne({
      $or: [{ email }, { phone }],
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingContact) {
      return res.status(409).json({
        success: false,
        message: 'A contact request with this email or phone already exists within the last 24 hours'
      });
    }

    // Create new contact
    const chatContact = new ChatContact({
      name,
      email,
      phone,
      message: message || 'Contact request from chatbot',
      source: 'chatbot',
      chatSessionId: chatSessionId || null
    });

    await chatContact.save();

    res.status(201).json({
      success: true,
      message: 'Contact information saved successfully. Our team will reach out to you within 24 hours.',
      data: {
        id: chatContact._id,
        name: chatContact.name,
        email: chatContact.email,
        phone: chatContact.phone
      }
    });

  } catch (error) {
    console.error('Error creating chat contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save contact information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all chat contacts (admin only)
export const getAllChatContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, priority } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contacts = await ChatContact.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name email');

    const total = await ChatContact.countDocuments(query);

    const result = {
      docs: contacts,
      totalDocs: total,
      limit: parseInt(limit),
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching chat contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get pending contacts
export const getPendingContacts = async (req, res) => {
  try {
    const pendingContacts = await ChatContact.getPendingContacts();

    res.json({
      success: true,
      data: pendingContacts,
      count: pendingContacts.length
    });

  } catch (error) {
    console.error('Error fetching pending contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update contact status
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, note } = req.body;

    const contact = await ChatContact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    if (assignedTo) contact.assignedTo = assignedTo;

    // Handle status-specific updates
    if (status === 'contacted' && contact.status !== 'contacted') {
      contact.contactedAt = new Date();
    }
    if (status === 'resolved' && contact.status !== 'resolved') {
      contact.resolvedAt = new Date();
    }

    // Add note if provided
    if (note) {
      contact.notes.push({
        text: note,
        addedBy: req.user?.id || null,
        addedAt: new Date()
      });
    }

    await contact.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add note to contact
export const addNoteToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    const contact = await ChatContact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await contact.addNote(note, req.user?.id || null);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get contact by ID
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await ChatContact.findById(id)
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get contact statistics
export const getContactStats = async (req, res) => {
  try {
    const stats = await ChatContact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalContacts = await ChatContact.countDocuments();
    const todayContacts = await ChatContact.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    const formattedStats = {
      total: totalContacts,
      today: todayContacts,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
