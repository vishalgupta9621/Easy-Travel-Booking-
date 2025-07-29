import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import User from '../models/users.model.js';
import Hotel from '../models/Hotel.js';
import Bus from '../models/Bus.js';
import Train from '../models/Train.js';
import Flight from '../models/Flight.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get current date and date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Count totals
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalHotels = await Hotel.countDocuments();
    const totalBuses = await Bus.countDocuments();
    const totalTrains = await Train.countDocuments();
    const totalFlights = await Flight.countDocuments();

    // Count this month vs last month for percentage calculation
    const bookingsThisMonth = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const bookingsLastMonth = await Booking.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Calculate revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueThisMonth = await Payment.aggregate([
      { 
        $match: { 
          status: 'success',
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueLastMonth = await Payment.aggregate([
      { 
        $match: { 
          status: 'success',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const userPercentageChange = calculatePercentageChange(usersThisMonth, usersLastMonth);
    const bookingPercentageChange = calculatePercentageChange(bookingsThisMonth, bookingsLastMonth);
    const revenuePercentageChange = calculatePercentageChange(
      revenueThisMonth[0]?.total || 0,
      revenueLastMonth[0]?.total || 0
    );

    // Get booking distribution by type
    const bookingsByType = await Booking.aggregate([
      { $group: { _id: '$bookingType', count: { $sum: 1 } } }
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('bookingNumber bookingType customerInfo totalAmount createdAt bookingStatus');

    // Get monthly revenue data for chart (last 6 months)
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalServices: totalHotels + totalBuses + totalTrains + totalFlights,
          userPercentageChange,
          bookingPercentageChange,
          revenuePercentageChange
        },
        services: {
          hotels: totalHotels,
          buses: totalBuses,
          trains: totalTrains,
          flights: totalFlights
        },
        bookingsByType,
        recentBookings,
        monthlyRevenue,
        thisMonth: {
          users: usersThisMonth,
          bookings: bookingsThisMonth,
          revenue: revenueThisMonth[0]?.total || 0
        },
        lastMonth: {
          users: usersLastMonth,
          bookings: bookingsLastMonth,
          revenue: revenueLastMonth[0]?.total || 0
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
};

// Get booking trends for charts
export const getBookingTrends = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
    }

    const trends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: period === '7days' || period === '30days' ? { $dayOfMonth: '$createdAt' } : null
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: trends
    });

  } catch (error) {
    console.error('Booking trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking trends',
      error: error.message
    });
  }
};
