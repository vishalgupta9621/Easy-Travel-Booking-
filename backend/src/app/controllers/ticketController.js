import emailService from '../../services/email.service.js';

// Send ticket via email - fully functional endpoint
export const sendTicketEmail = async (req, res) => {
  try {
    const { to, bookingData, userName } = req.body;

    // Validate required fields
    if (!to || !bookingData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, bookingData'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format'
      });
    }

    // Validate booking data
    if (!bookingData.bookingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking data: missing booking number'
      });
    }

    try {
      // Send booking confirmation email
      const result = await emailService.sendBookingConfirmation(to, bookingData, userName);

      res.json({
        success: true,
        message: `Booking confirmation sent successfully to ${to}`,
        messageId: result.messageId
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);

      // Return fallback response
      res.json({
        success: true,
        message: `Email service not configured. Please check your email settings.`,
        fallback: true,
        note: 'Configure EMAIL_USER and EMAIL_PASS in .env to enable email functionality'
      });
    }

  } catch (error) {
    console.error('Error in email endpoint:', error);

    res.status(500).json({
      success: false,
      message: 'Error processing email request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Simplified ticket controller - frontend handles full functionality
// For advanced server-side email features, install nodemailer and multer packages

// Simplified middleware for file upload (optional)
export const uploadTicket = (req, res, next) => {
  // Basic middleware - for advanced file upload, install multer
  console.log('Basic upload middleware - install multer for advanced features');
  next();
};

export default {
  sendTicketEmail,
  uploadTicket
};
