import BaseService from './base/base.service.js';
import universalBookingRepository from '../repositories/universalBooking.repository.js';

export class UniversalBookingService extends BaseService {
    constructor() {
        super(universalBookingRepository);
    }

    async createBooking(bookingData) {
        // Validate required fields
        if (!bookingData.userId || !bookingData.bookingType) {
            throw new Error('User ID and booking type are required');
        }

        // Validate booking type
        const validBookingTypes = ['hotel', 'flight', 'train', 'bus'];
        if (!validBookingTypes.includes(bookingData.bookingType)) {
            throw new Error('Invalid booking type. Must be one of: hotel, flight, train, bus');
        }

        // Validate passenger/guest details
        if (!bookingData.passengerDetails?.primaryPassenger?.firstName ||
            !bookingData.passengerDetails?.primaryPassenger?.lastName ||
            !bookingData.passengerDetails?.primaryPassenger?.email ||
            !bookingData.passengerDetails?.primaryPassenger?.phone) {
            throw new Error('Primary passenger details (name, email, phone) are required');
        }

        // Validate pricing
        if (!bookingData.pricing?.totalPrice || bookingData.pricing.totalPrice <= 0) {
            throw new Error('Total price must be positive');
        }

        // Validate payment details
        if (!bookingData.payment?.method || !bookingData.payment?.transactionId) {
            throw new Error('Payment method and transaction ID are required');
        }

        // Type-specific validations
        if (bookingData.bookingType === 'hotel') {
            if (!bookingData.hotelDetails?.hotelName || !bookingData.hotelDetails?.checkIn || !bookingData.hotelDetails?.checkOut) {
                throw new Error('Hotel name, check-in, and check-out dates are required for hotel bookings');
            }
        } else {
            // For travel bookings (flight, train, bus)
            if (!bookingData.travelDetails?.serviceName || !bookingData.travelDetails?.departureDate) {
                throw new Error('Service name and departure date are required for travel bookings');
            }
        }

        return await this.create(bookingData);
    }

    async updateBooking(id, bookingData) {
        const booking = await this.getById(id);
        if (!booking) {
            throw new Error('Universal booking not found');
        }

        // Prevent updating certain fields after booking is confirmed
        if (booking.status === 'confirmed') {
            const restrictedFields = ['bookingType', 'travelDetails', 'hotelDetails'];
            const hasRestrictedUpdates = restrictedFields.some(field => bookingData[field]);
            
            if (hasRestrictedUpdates) {
                throw new Error('Cannot update booking details for confirmed bookings');
            }
        }

        return await this.updateById(id, bookingData);
    }

    async getPaginatedBookings(page, limit) {
        return await universalBookingRepository.getPaginated(page, limit);
    }

    async getBookingsByUser(userId) {
        return await universalBookingRepository.findByUserId(userId);
    }

    async getBookingsByType(bookingType) {
        const validBookingTypes = ['hotel', 'flight', 'train', 'bus'];
        if (!validBookingTypes.includes(bookingType)) {
            throw new Error('Invalid booking type');
        }

        return await universalBookingRepository.findByBookingType(bookingType);
    }

    async updateBookingStatus(id, status) {
        const validStatuses = ['confirmed', 'pending', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const booking = await this.getById(id);
        if (!booking) {
            throw new Error('Universal booking not found');
        }

        // Validate status transitions
        if (booking.status === 'cancelled' && status !== 'cancelled') {
            throw new Error('Cannot change status of cancelled booking');
        }

        return await this.updateById(id, { status });
    }

    async updatePaymentStatus(id, paymentStatus, transactionId) {
        const validPaymentStatuses = ['pending', 'completed', 'failed'];
        if (!validPaymentStatuses.includes(paymentStatus)) {
            throw new Error('Invalid payment status');
        }

        const updateData = {
            'payment.paymentStatus': paymentStatus
        };

        if (transactionId) {
            updateData['payment.transactionId'] = transactionId;
        }

        if (paymentStatus === 'completed') {
            updateData['payment.paymentDate'] = new Date();
        }

        return await this.updateById(id, updateData);
    }

    async getBookingsByDateRange(startDate, endDate) {
        return await universalBookingRepository.findByDateRange(startDate, endDate);
    }

    async getBookingStats() {
        const stats = await universalBookingRepository.getBookingStats();
        
        // Add additional calculated stats
        const totalBookings = stats.reduce((sum, stat) => sum + stat.count, 0);
        const totalRevenue = stats.reduce((sum, stat) => sum + stat.revenue, 0);

        return {
            byType: stats,
            total: {
                bookings: totalBookings,
                revenue: totalRevenue
            }
        };
    }

    async searchBookings(query, type, status) {
        const searchCriteria = {};

        if (query) {
            searchCriteria.$or = [
                { ticketId: { $regex: query, $options: 'i' } },
                { 'passengerDetails.primaryPassenger.firstName': { $regex: query, $options: 'i' } },
                { 'passengerDetails.primaryPassenger.lastName': { $regex: query, $options: 'i' } },
                { 'passengerDetails.primaryPassenger.email': { $regex: query, $options: 'i' } }
            ];
        }

        if (type) {
            const validBookingTypes = ['hotel', 'flight', 'train', 'bus'];
            if (!validBookingTypes.includes(type)) {
                throw new Error('Invalid booking type');
            }
            searchCriteria.bookingType = type;
        }

        if (status) {
            const validStatuses = ['confirmed', 'pending', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid status');
            }
            searchCriteria.status = status;
        }

        return await universalBookingRepository.search(searchCriteria);
    }

    async getRevenueByPeriod(startDate, endDate, groupBy = 'day') {
        const validGroupBy = ['day', 'week', 'month', 'year'];
        if (!validGroupBy.includes(groupBy)) {
            throw new Error('Invalid groupBy parameter. Must be one of: day, week, month, year');
        }

        return await universalBookingRepository.getRevenueByPeriod(startDate, endDate, groupBy);
    }

    async getPopularDestinations(limit = 10) {
        return await universalBookingRepository.getPopularDestinations(limit);
    }
}

export default new UniversalBookingService();
