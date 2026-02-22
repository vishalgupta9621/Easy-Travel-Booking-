import BaseRepository from './base/base.repository.js';
import Booking from '../models/Booking.js';

export class HotelBookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }

  async findByUserId(userId) {
    return this.model.find({ userId, bookingType: 'hotel' })
      .populate('userId', 'username firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async findByHotelId(hotelId) {
    return this.model.find({ bookingType: 'hotel', 'itemDetails.hotelId': hotelId })
      .populate('userId', 'username firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async findByBookingId(bookingNumber) {
    return this.model.findOne({ bookingNumber, bookingType: 'hotel' })
      .populate('userId', 'username firstName lastName email');
  }

  async findByDateRange(startDate, endDate) {
    return this.model.find({
      bookingType: 'hotel',
      $or: [
        {
          travelDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        {
          returnDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        {
          travelDate: { $lte: new Date(startDate) },
          returnDate: { $gte: new Date(endDate) }
        }
      ]
    })
      .populate('userId', 'username firstName lastName email')
      .sort({ travelDate: 1 });
  }

  async getPaginated(page, limit) {
    const skip = (page - 1) * limit;
    const query = { bookingType: 'hotel' };

    const bookings = await this.model.find(query)
      .populate('userId', 'username firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.model.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return {
      bookings,
      pagination: { total, page, limit, pages }
    };
  }

  async getBookingStats() {
    return this.model.aggregate([
      { $match: { bookingType: 'hotel' } },
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$paymentInfo.amount' },
          avgStayDuration: {
            $avg: {
              $divide: [
                { $subtract: ['$returnDate', '$travelDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  async getBookingsByStatus(status) {
    return this.model.find({ bookingType: 'hotel', bookingStatus: status })
      .populate('userId', 'username firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async getBookingsByPaymentStatus(paymentStatus) {
    return this.model.find({ bookingType: 'hotel', 'paymentInfo.status': paymentStatus })
      .populate('userId', 'username firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async getRevenueByPeriod(startDate, endDate, groupBy = 'day') {
    let groupFormat;
    switch (groupBy) {
      case 'day': groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }; break;
      case 'week': groupFormat = { $dateToString: { format: "%Y-W%U", date: "$createdAt" } }; break;
      case 'month': groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } }; break;
      case 'year': groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } }; break;
      default: groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    return this.model.aggregate([
      {
        $match: {
          bookingType: 'hotel',
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          'paymentInfo.status': 'success'
        }
      },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: { $sum: '$paymentInfo.amount' },
          bookingCount: { $sum: 1 },
          avgBookingValue: { $avg: '$paymentInfo.amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
}

export default new HotelBookingRepository();
