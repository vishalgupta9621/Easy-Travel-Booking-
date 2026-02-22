import Hotel from '../../../models/Hotel.js';
import HotelBooking from '../../../models/HotelBooking.js';
import Booking from '../../../models/Booking.js';

const hotelOwnerDashboardController = {
  // Get all hotels owned by a specific owner
  getOwnerHotels: async (req, res) => {
    try {
      const { ownerEmail } = req.params;
      
      // Find hotels owned by this email
      const hotels = await Hotel.find({ 
        $or: [
          { 'ownerEmail': ownerEmail },
          { 'contactEmail': ownerEmail },
          { 'email': ownerEmail }
        ]
      });

      // Get booking counts for each hotel from the general Booking collection
      const hotelsWithStats = await Promise.all(
        hotels.map(async (hotel) => {
          const totalBookings = await Booking.countDocuments({
            bookingType: 'hotel',
            itemId: hotel._id
          });
          const activeBookings = await Booking.countDocuments({
            bookingType: 'hotel',
            itemId: hotel._id,
            bookingStatus: { $in: ['pending', 'confirmed'] }
          });

          return {
            ...hotel.toObject(),
            bookingCount: totalBookings,
            activeBookings: activeBookings
          };
        })
      );

      res.json({
        success: true,
        hotels: hotelsWithStats,
        totalHotels: hotelsWithStats.length
      });
    } catch (error) {
      console.error('Error fetching owner hotels:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotels',
        error: error.message
      });
    }
  },

  // Get all bookings for hotels owned by a specific owner
  getOwnerBookings: async (req, res) => {
    try {
      const { ownerEmail } = req.params;
      
      // First find all hotels owned by this email
      const hotels = await Hotel.find({ 
        $or: [
          { 'ownerEmail': ownerEmail },
          { 'contactEmail': ownerEmail },
          { 'email': ownerEmail }
        ]
      });

      if (hotels.length === 0) {
        return res.json({
          success: true,
          bookings: [],
          totalBookings: 0,
          message: 'No hotels found for this owner'
        });
      }

      const hotelIds = hotels.map(hotel => hotel._id);

      // Get all hotel bookings from the general Booking collection
      const bookings = await Booking.find({
        bookingType: 'hotel',
        itemId: { $in: hotelIds }
      })
      .populate('itemId', 'name city address')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

      // Format bookings for frontend
      const formattedBookings = bookings.map(booking => ({
        _id: booking._id,
        bookingNumber: booking.bookingNumber,
        guestName: booking.customerInfo?.name || booking.userId?.username || 'Guest',
        guestEmail: booking.customerInfo?.email || booking.userId?.email,
        hotelName: booking.itemDetails?.name || booking.itemId?.name || 'Unknown Hotel',
        hotelCity: booking.itemDetails?.city || booking.itemId?.city,
        checkInDate: booking.hotelBooking?.checkIn || booking.itemDetails?.checkIn || booking.travelDate,
        checkOutDate: booking.hotelBooking?.checkOut || booking.itemDetails?.checkOut || booking.returnDate,
        totalAmount: booking.totalAmount,
        status: booking.bookingStatus,
        paymentStatus: booking.paymentInfo?.status,
        adults: booking.hotelBooking?.adults || booking.itemDetails?.adults,
        children: booking.hotelBooking?.children || booking.itemDetails?.children,
        specialRequests: booking.specialRequests,
        bookingDate: booking.bookingDate,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }));

      res.json({
        success: true,
        bookings: formattedBookings,
        totalBookings: formattedBookings.length
      });
    } catch (error) {
      console.error('Error fetching owner bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
        error: error.message
      });
    }
  },

  // Get booking statistics for hotel owner
  getOwnerBookingStats: async (req, res) => {
    try {
      const { ownerEmail } = req.params;
      
      // First find all hotels owned by this email
      const hotels = await Hotel.find({ 
        $or: [
          { 'ownerEmail': ownerEmail },
          { 'contactEmail': ownerEmail },
          { 'email': ownerEmail }
        ]
      });

      if (hotels.length === 0) {
        return res.json({
          success: true,
          stats: {
            totalBookings: 0,
            activeBookings: 0,
            totalRevenue: 0,
            completedBookings: 0
          }
        });
      }

      const hotelIds = hotels.map(hotel => hotel._id);

      // Get booking statistics from the general Booking collection
      const totalBookings = await Booking.countDocuments({
        bookingType: 'hotel',
        itemId: { $in: hotelIds }
      });

      const activeBookings = await Booking.countDocuments({
        bookingType: 'hotel',
        itemId: { $in: hotelIds },
        bookingStatus: { $in: ['pending', 'confirmed'] }
      });

      const completedBookings = await Booking.countDocuments({
        bookingType: 'hotel',
        itemId: { $in: hotelIds },
        bookingStatus: 'completed'
      });

      // Calculate total revenue
      const revenueResult = await Booking.aggregate([
        { $match: { bookingType: 'hotel', itemId: { $in: hotelIds } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

      res.json({
        success: true,
        stats: {
          totalBookings,
          activeBookings,
          completedBookings,
          totalRevenue
        }
      });
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking statistics',
        error: error.message
      });
    }
  },

  // Get bookings for a specific hotel (with owner verification)
  getHotelBookings: async (req, res) => {
    try {
      const { hotelId } = req.params;
      const { ownerEmail } = req.query;

      // Verify that the hotel belongs to this owner
      const hotel = await Hotel.findOne({ 
        _id: hotelId,
        $or: [
          { 'ownerEmail': ownerEmail },
          { 'contactEmail': ownerEmail },
          { 'email': ownerEmail }
        ]
      });

      if (!hotel) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Hotel not found or you are not the owner.'
        });
      }

      // Get bookings for this hotel
      const bookings = await HotelBooking.find({ hotelId })
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        bookings,
        hotel: hotel.name
      });
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hotel bookings',
        error: error.message
      });
    }
  },

  // Update booking status (for hotel owner)
  updateBookingStatus: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { status, ownerEmail } = req.body;

      // Find the booking and verify ownership
      const booking = await Booking.findById(bookingId).populate('itemId');

      if (!booking || booking.bookingType !== 'hotel') {
        return res.status(404).json({
          success: false,
          message: 'Hotel booking not found'
        });
      }

      // Verify that the hotel belongs to this owner
      const hotel = await Hotel.findOne({
        _id: booking.itemId._id,
        $or: [
          { 'ownerEmail': ownerEmail },
          { 'contactEmail': ownerEmail },
          { 'email': ownerEmail }
        ]
      });

      if (!hotel) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not the owner of this hotel.'
        });
      }

      // Update booking status
      booking.bookingStatus = status;
      booking.updatedAt = new Date();

      // Set check-in/check-out dates if applicable
      if (status === 'checked_in' && booking.hotelBooking) {
        booking.hotelBooking.actualCheckInDate = new Date();
      } else if (status === 'checked_out' && booking.hotelBooking) {
        booking.hotelBooking.actualCheckOutDate = new Date();
      }

      await booking.save();

      res.json({
        success: true,
        message: 'Booking status updated successfully',
        booking
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking status',
        error: error.message
      });
    }
  }
};

export default hotelOwnerDashboardController;
