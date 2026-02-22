import BaseRepository from './base/base.repository.js';
import Booking from '../models/Booking.js';

export class UniversalBookingRepository extends BaseRepository {
    constructor() {
        super(Booking);
    }

    async findByUserId(userId) {
        return this.model.find({ userId })
            .populate('userId', 'username firstName lastName email')
            .sort({ createdAt: -1 });
    }

    async findByBookingType(bookingType) {
        return this.model.find({ bookingType })
            .populate('userId', 'username firstName lastName email')
            .sort({ createdAt: -1 });
    }

    async findByTicketId(ticketId) {
        return this.model.findOne({ ticketId })
            .populate('userId', 'username firstName lastName email');
    }

    async findByDateRange(startDate, endDate) {
        return this.model.find({
            bookingDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
        .populate('userId', 'username firstName lastName email')
        .sort({ bookingDate: 1 });
    }

    async getPaginated(page, limit) {
        const skip = (page - 1) * limit;

        const bookings = await this.model.find()
            .populate('userId', 'username firstName lastName email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await this.model.countDocuments();
        const pages = Math.ceil(total / limit);

        return {
            bookings,
            pagination: {
                total,
                page,
                limit,
                pages
            }
        };
    }

    async search(criteria) {
        return this.model.find(criteria)
            .populate('userId', 'username firstName lastName email')
            .sort({ createdAt: -1 });
    }

    async getBookingStats() {
        return this.model.aggregate([
            {
                $group: {
                    _id: {
                        bookingType: '$bookingType',
                        bookingStatus: '$bookingStatus'
                    },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                $group: {
                    _id: '$_id.bookingType',
                    statuses: {
                        $push: {
                            status: '$_id.bookingStatus',
                            count: '$count',
                            revenue: '$totalRevenue'
                        }
                    },
                    totalCount: { $sum: '$count' },
                    totalRevenue: { $sum: '$totalRevenue' }
                }
            },
            { $sort: { totalCount: -1 } }
        ]);
    }

    async getBookingsByStatus(status) {
        return this.model.find({ bookingStatus: status })
            .populate('userId', 'username firstName lastName email')
            .sort({ createdAt: -1 });
    }

    async getBookingsByPaymentStatus(paymentStatus) {
        return this.model.find({ 'paymentInfo.status': paymentStatus })
            .populate('userId', 'username firstName lastName email')
            .sort({ createdAt: -1 });
    }

    async getRevenueByPeriod(startDate, endDate, groupBy = 'day') {
        let groupFormat;
        switch (groupBy) {
            case 'day':
                groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
                break;
            case 'week':
                groupFormat = { $dateToString: { format: "%Y-W%U", date: "$createdAt" } };
                break;
            case 'month':
                groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
                break;
            case 'year':
                groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
                break;
            default:
                groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        }

        return this.model.aggregate([
            {
                $match: {
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
                    totalRevenue: { $sum: '$totalAmount' },
                    bookingCount: { $sum: 1 },
                    avgBookingValue: { $avg: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }

    async getPopularDestinations(limit = 10) {
        return this.model.aggregate([
            {
                $match: {
                    bookingType: { $in: ['flight', 'train', 'bus'] }
                }
            },
            {
                $group: {
                    _id: '$travelDetails.route',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);
    }

    async getBookingTrends(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return this.model.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        type: '$bookingType'
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    types: {
                        $push: {
                            type: '$_id.type',
                            count: '$count',
                            revenue: '$revenue'
                        }
                    },
                    totalCount: { $sum: '$count' },
                    totalRevenue: { $sum: '$revenue' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }

    async getTopCustomers(limit = 10) {
        return this.model.aggregate([
            {
                $group: {
                    _id: '$userId',
                    bookingCount: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    avgBookingValue: { $avg: '$totalAmount' }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' }
        ]);
    }
}

export default new UniversalBookingRepository();
