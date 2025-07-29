import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import User from '../models/users.model.js';
import Hotel from '../models/Hotel.js';
import Flight from '../models/Flight.js';
import Train from '../models/Train.js';
import Bus from '../models/Bus.js';
import Package from '../models/Package.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      bookingType,
      itemId,
      customerInfo,
      paymentInfo,
      travelDate,
      returnDate,
      passengers,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!bookingType || !itemId || !customerInfo || !paymentInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Get item details based on booking type
    let itemDetails;
    let totalAmount = paymentInfo.amount;

    switch (bookingType) {
      case 'hotel':
        itemDetails = await Hotel.findById(itemId);
        if (!itemDetails) {
          return res.status(404).json({
            success: false,
            message: 'Hotel not found'
          });
        }
        break;

      case 'flight':
        itemDetails = await Flight.findById(itemId)
          .populate('airline')
          .populate('route.origin')
          .populate('route.destination');
        if (!itemDetails) {
          return res.status(404).json({
            success: false,
            message: 'Flight not found'
          });
        }
        break;

      case 'train':
        itemDetails = await Train.findById(itemId)
          .populate('route.origin')
          .populate('route.destination');
        if (!itemDetails) {
          return res.status(404).json({
            success: false,
            message: 'Train not found'
          });
        }
        break;

      case 'bus':
        itemDetails = await Bus.findById(itemId)
          .populate('route.origin')
          .populate('route.destination');
        if (!itemDetails) {
          return res.status(404).json({
            success: false,
            message: 'Bus not found'
          });
        }
        break;

      case 'package':
        itemDetails = await Package.findById(itemId);
        if (!itemDetails) {
          return res.status(404).json({
            success: false,
            message: 'Package not found'
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid booking type'
        });
    }

    // Use authenticated user's ID if available
    let userId = req.user?._id || null;
    
    // For backward compatibility, if userId is not available from auth,
    // try to find user by email (for guest bookings or legacy support)
    if (!userId && customerInfo.email) {
      const existingUser = await User.findOne({ email: customerInfo.email });
      if (existingUser) {
        userId = existingUser._id;
      }
    }

    // Create booking
    const booking = new Booking({
      bookingType,
      itemId,
      itemDetails: itemDetails.toObject(),
      customerInfo,
      paymentInfo,
      totalAmount,
      travelDate,
      returnDate,
      passengers,
      specialRequests,
      userId: userId
    });

    await booking.save();

    // Save payment information separately
    if (paymentInfo) {
      const payment = new Payment({
        paymentId: paymentInfo.paymentId,
        bookingNumber: booking.bookingNumber,
        orderId: paymentInfo.orderId || 'order_' + Date.now(),
        amount: paymentInfo.amount || totalAmount,
        currency: paymentInfo.currency || 'INR',
        method: paymentInfo.method || 'demo',
        status: paymentInfo.status || 'success',
        signature: paymentInfo.signature,
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone
        },
        timestamp: paymentInfo.timestamp ? new Date(paymentInfo.timestamp) : new Date()
      });

      await payment.save();
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingNumber: booking.bookingNumber,
        bookingId: booking._id,
        bookingType: booking.bookingType,
        totalAmount: booking.totalAmount,
        bookingStatus: booking.bookingStatus
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get all bookings (for admin)
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments();

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error.message
    });
  }
};

// Get booking by booking number
export const getBookingByNumber = async (req, res) => {
  try {
    const { bookingNumber } = req.params;

    const booking = await Booking.findOne({ bookingNumber });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking',
      error: error.message
    });
  }
};

// Get all bookings for a user
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // First try to find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query to find bookings by userId OR by email
    const query = {
      $or: [
        { userId: userId },
        { 'customerInfo.email': user.email }
      ]
    };

    if (status) {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error.message
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { bookingNumber },
      { 
        bookingStatus: status,
        notes: notes || booking.notes
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { bookingNumber },
      { 
        bookingStatus: 'cancelled',
        notes: reason || 'Cancelled by user'
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgAmount: { $avg: '$totalAmount' }
        }
      }
    ]);

    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byType: stats,
        byStatus: statusStats
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking statistics',
      error: error.message
    });
  }
};
