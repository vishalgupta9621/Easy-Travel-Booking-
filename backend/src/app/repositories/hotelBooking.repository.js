import BaseRepository from './base/base.repository.js';
import HotelBooking from '../models/HotelBooking.js';

export class HotelBookingRepository extends BaseRepository {
    constructor() {
        super(HotelBooking);
    }

    async findByUserId(userId) {
        return this.model.find({ userId })
            .populate('userId', 'username firstName lastName email')
            .populate('hotelId', 'name city address')
            .populate('roomId', 'roomType price')
            .sort({ createdAt: -1 });
    }

    async findByHotelId(hotelId) {
        return this.model.find({ hotelId })
            .populate('userId', 'username firstName lastName email')
            .populate('hotelId', 'name city address')
            .populate('roomId', 'roomType price')
            .sort({ createdAt: -1 });
    }

    async findByBookingId(bookingId) {
        return this.model.findOne({ bookingId })
            .populate('userId', 'username firstName lastName email')
            .populate('hotelId', 'name city address')
            .populate('roomId', 'roomType price');
    }

    async findByDateRange(startDate, endDate) {
        return this.model.find({
            $or: [
                {
                    checkIn: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                },
                {
                    checkOut: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                },
                {
                    checkIn: { $lte: new Date(startDate) },
                    checkOut: { $gte: new Date(endDate) }
                }
            ]
        })
        .populate('userId', 'username firstName lastName email')
        .populate('hotelId', 'name city address')
        .populate('roomId', 'roomType price')
        .sort({ checkIn: 1 });
    }

    async getPaginated(page, limit) {
        const skip = (page - 1) * limit;
        
        const bookings = await this.model.find()
            .populate('userId', 'username firstName lastName email')
            .populate('hotelId', 'name city address')
            .populate('roomId', 'roomType price')
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

    async checkRoomAvailability(hotelId, roomId, checkIn, checkOut) {
        const conflictingBookings = await this.model.find({
            hotelId,
            roomId,
            status: { $in: ['confirmed', 'checked_in'] },
            $or: [
                {
                    checkIn: {
                        $lt: new Date(checkOut),
                        $gte: new Date(checkIn)
                    }
                },
                {
                    checkOut: {
                        $gt: new Date(checkIn),
                        $lte: new Date(checkOut)
                    }
                },
                {
                    checkIn: { $lte: new Date(checkIn) },
                    checkOut: { $gte: new Date(checkOut) }
                }
            ]
        });

        return conflictingBookings.length === 0;
    }

    async getHotelOccupancy(hotelId, date) {
        const targetDate = new Date(date);
        
        const occupiedRooms = await this.model.find({
            hotelId,
            status: { $in: ['confirmed', 'checked_in'] },
            checkIn: { $lte: targetDate },
            checkOut: { $gt: targetDate }
        }).countDocuments();

        return occupiedRooms;
    }

    async getBookingStats() {
        return this.model.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.totalPrice' },
                    avgStayDuration: {
                        $avg: {
                            $divide: [
                                { $subtract: ['$checkOut', '$checkIn'] },
                                1000 * 60 * 60 * 24 // Convert to days
                            ]
                        }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);
    }

    async getBookingsByStatus(status) {
        return this.model.find({ status })
            .populate('userId', 'username firstName lastName email')
            .populate('hotelId', 'name city address')
            .populate('roomId', 'roomType price')
            .sort({ createdAt: -1 });
    }

    async getBookingsByPaymentStatus(paymentStatus) {
        return this.model.find({ 'payment.paymentStatus': paymentStatus })
            .populate('userId', 'username firstName lastName email')
            .populate('hotelId', 'name city address')
            .populate('roomId', 'roomType price')
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
                    totalRevenue: { $sum: '$pricing.totalPrice' },
                    bookingCount: { $sum: 1 },
                    avgBookingValue: { $avg: '$pricing.totalPrice' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }

    async getPopularHotels(limit = 10) {
        return this.model.aggregate([
            {
                $group: {
                    _id: '$hotelId',
                    bookingCount: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.totalPrice' },
                    avgRating: { $avg: '$rating' }
                }
            },
            { $sort: { bookingCount: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'hotels',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'hotelInfo'
                }
            },
            { $unwind: '$hotelInfo' }
        ]);
    }
}

export default new HotelBookingRepository();
