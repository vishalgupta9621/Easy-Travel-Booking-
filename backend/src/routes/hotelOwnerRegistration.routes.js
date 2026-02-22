import express from 'express';
import emailService from '../services/email.service.js';

const router = express.Router();

// POST /api/v1/hotel-owner-registration - Submit hotel owner registration
router.post('/', async (req, res) => {
  try {
    const registrationData = req.body;

    // Validate required fields
    const requiredFields = [
      'ownerName', 'ownerEmail', 'ownerPhone',
      'hotelName', 'hotelType', 'city',
      'businessLicense', 'gstNumber',
      'totalRooms', 'checkInTime', 'checkOutTime',
      'termsAccepted'
    ];

    const missingFields = requiredFields.filter(field => !registrationData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.ownerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format'
      });
    }

    // Validate terms acceptance
    if (!registrationData.termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Terms and conditions must be accepted'
      });
    }

    try {
      // Send emails
      const emailResult = await emailService.sendHotelOwnerRegistration(registrationData);

      // Log the registration for tracking
      console.log('🏨 Hotel Owner Registration Received:', {
        hotelName: registrationData.hotelName,
        ownerName: registrationData.ownerName,
        ownerEmail: registrationData.ownerEmail,
        city: registrationData.city,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Registration submitted successfully! We will review your application and contact you within 2-3 business days.',
        data: {
          hotelName: registrationData.hotelName,
          ownerName: registrationData.ownerName,
          submissionTime: new Date().toISOString(),
          emailSent: true,
          adminMessageId: emailResult.adminMessageId,
          ownerMessageId: emailResult.ownerMessageId
        }
      });

    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);

      // Even if email fails, we should still accept the registration
      // Log the data for manual processing
      console.log('📧 MANUAL PROCESSING REQUIRED - Hotel Registration Data:', registrationData);

      res.status(200).json({
        success: true,
        message: 'Registration submitted successfully! We will review your application and contact you within 2-3 business days.',
        data: {
          hotelName: registrationData.hotelName,
          ownerName: registrationData.ownerName,
          submissionTime: new Date().toISOString(),
          emailSent: false,
          note: 'Registration received but email notification failed. Manual processing required.'
        }
      });
    }

  } catch (error) {
    console.error('❌ Error in hotel owner registration:', error);

    res.status(500).json({
      success: false,
      message: 'Error processing registration request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/v1/hotel-owner-registration/status/:email - Get registration status (optional)
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // This is a placeholder - you would implement actual status checking
    // based on your database or tracking system
    
    res.status(200).json({
      success: true,
      message: 'Registration status retrieved',
      data: {
        email,
        status: 'under_review',
        submittedAt: new Date().toISOString(),
        estimatedReviewTime: '2-3 business days'
      }
    });

  } catch (error) {
    console.error('❌ Error getting registration status:', error);

    res.status(500).json({
      success: false,
      message: 'Error retrieving registration status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
