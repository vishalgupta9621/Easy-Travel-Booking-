import BaseRepository from './base/base.repository.js';
import TravelBooking from '../models/TravelBooking.js';

export class TravelBookingRepository extends BaseRepository {
    constructor() {
        super(TravelBooking);
    }

    async findByUserId(userId) {
        return this.model.find({ userId })
            .populate('userId', 'username firstName lastName email')
            .populate('journey.origin journey.destination')
            .sort({ createdAt: -1 });
    }

    async findByTravelType(travelType) {
        return this.model.find({ travelType })
            .populate('userId', 'username firstName lastName email')
            .populate('journey.origin journey.destination')
            .sort({ createdAt: -1 });
    }

    async findByBookingId(bookingId) {
        return this.model.findOne({ bookingId })
            .populate('userId', 'username firstName lastName email')
            .populate('journey.origin journey.destination');
    }

    async findByDateRange(startDate, endDate) {
        return this.model.find({
            'journey.departureDate': {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
        .populate('userId', 'username firstName lastName email')
        .populate('journey.origin journey.destination')
        .sort({ 'journey.departureDate': 1 });
    }

    async getPaginated(page, limit) {
        const skip = (page - 1) * limit;
        
        const bookings = await this.model.find()
            .populate('userId', 'username firstName lastName email')
            .populate('journey.origin journey.destination')
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

    async getBookingStats() {
        return this.model.aggregate([
            {
                $group: {
                    _id: {
                        travelType: '$travelType',
                        status: '$status'
                    },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.totalAmount' }
                }
            },
            {
                $group: {
                    _id: '$_id.travelType',
                    statuses: {
                        $push: {
                            status: '$_id.status',
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
        return this.model.find({ status })
            .populate('userId', 'username firstName lastName email')
            .populate('journey.origin journey.destination')
            .sort({ createdAt: -1 });
    }

    async getBookingsByPaymentStatus(paymentStatus) {
        return this.model.find({ 'payment.paymentStatus': paymentStatus })
            .populate('userId', 'username firstName lastName email')
            .populate('journey.origin journey.destination')
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
                    'payment.paymentStatus': 'completed'
                }
            },
            {
                $group: {
                    _id: groupFormat,
                    totalRevenue: { $sum: '$pricing.totalAmount' },
                    bookingCount: { $sum: 1 },
                    avgBookingValue: { $avg: '$pricing.totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }

    async getPopularRoutes(limit = 10) {
        return this.model.aggregate([
            {
                $group: {
                    _id: {
                        origin: '$journey.origin',
                        destination: '$journey.destination'
                    },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.totalAmount' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'destinations',
                    localField: '_id.origin',
                    foreignField: '_id',
                    as: 'originInfo'
                }
            },
            {
                $lookup: {
                    from: 'destinations',
                    localField: '_id.destination',
                    foreignField: '_id',
                    as: 'destinationInfo'
                }
            }
        ]);
    }
}

export default new TravelBookingRepository();
