import BaseService from './base/base.service.js';
import travelBookingRepository from '../repositories/travelBooking.repository.js';

export class TravelBookingService extends BaseService {
    constructor() {
        super(travelBookingRepository);
    }

    async createBooking(bookingData) {
        // Validate required fields
        if (!bookingData.userId || !bookingData.travelType || !bookingData.serviceId) {
            throw new Error('User ID, travel type, and service ID are required');
        }

        // Validate travel type
        const validTravelTypes = ['flight', 'train', 'bus'];
        if (!validTravelTypes.includes(bookingData.travelType)) {
            throw new Error('Invalid travel type. Must be one of: flight, train, bus');
        }

        // Validate journey details
        if (!bookingData.journey?.origin || !bookingData.journey?.destination || !bookingData.journey?.departureDate) {
            throw new Error('Journey origin, destination, and departure date are required');
        }

        // Validate passengers
        if (!bookingData.passengers || bookingData.passengers.length === 0) {
            throw new Error('At least one passenger is required');
        }

        // Validate pricing
        if (!bookingData.pricing?.totalAmount || bookingData.pricing.totalAmount <= 0) {
            throw new Error('Total amount must be positive');
        }

        // Validate payment details
        if (!bookingData.payment?.method || !bookingData.payment?.transactionId) {
            throw new Error('Payment method and transaction ID are required');
        }

        // Validate contact details
        if (!bookingData.contact?.email || !bookingData.contact?.phone) {
            throw new Error('Contact email and phone are required');
        }

        return await this.create(bookingData);
    }

    async updateBooking(id, bookingData) {
        const booking = await this.getById(id);
        if (!booking) {
            throw new Error('Travel booking not found');
        }

        // Prevent updating certain fields after booking is confirmed
        if (booking.status === 'confirmed' || booking.status === 'completed') {
            const restrictedFields = ['serviceId', 'travelType', 'journey', 'passengers'];
            const hasRestrictedUpdates = restrictedFields.some(field => bookingData[field]);
            
            if (hasRestrictedUpdates) {
                throw new Error('Cannot update journey details for confirmed bookings');
            }
        }

        return await this.updateById(id, bookingData);
    }

    async getPaginatedBookings(page, limit) {
        return await travelBookingRepository.getPaginated(page, limit);
    }

    async getBookingsByUser(userId) {
        return await travelBookingRepository.findByUserId(userId);
    }

    async getBookingsByType(travelType) {
        const validTravelTypes = ['flight', 'train', 'bus'];
        if (!validTravelTypes.includes(travelType)) {
            throw new Error('Invalid travel type');
        }

        return await travelBookingRepository.findByTravelType(travelType);
    }

    async updateBookingStatus(id, status) {
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const booking = await this.getById(id);
        if (!booking) {
            throw new Error('Travel booking not found');
        }

        // Validate status transitions
        if (booking.status === 'completed' && status !== 'completed') {
            throw new Error('Cannot change status of completed booking');
        }

        if (booking.status === 'cancelled' && status !== 'cancelled') {
            throw new Error('Cannot change status of cancelled booking');
        }

        return await this.updateById(id, { status, lastModified: new Date() });
    }

    async updatePaymentStatus(id, paymentStatus, transactionId) {
        const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validPaymentStatuses.includes(paymentStatus)) {
            throw new Error('Invalid payment status');
        }

        const updateData = {
            'payment.paymentStatus': paymentStatus,
            lastModified: new Date()
        };

        if (transactionId) {
            updateData['payment.transactionId'] = transactionId;
        }

        if (paymentStatus === 'completed') {
            updateData['payment.paymentDate'] = new Date();
        }

        return await this.updateById(id, updateData);
    }

    async cancelBooking(id, cancellationReason) {
        const booking = await this.getById(id);
        if (!booking) {
            throw new Error('Travel booking not found');
        }

        if (booking.status === 'completed') {
            throw new Error('Cannot cancel completed booking');
        }

        if (booking.status === 'cancelled') {
            throw new Error('Booking is already cancelled');
        }

        const updateData = {
            status: 'cancelled',
            'cancellation.cancellationDate': new Date(),
            'cancellation.cancellationReason': cancellationReason,
            lastModified: new Date()
        };

        // Calculate cancellation charges based on time before departure
        const departureDate = new Date(booking.journey.departureDate);
        const now = new Date();
        const hoursBeforeDeparture = (departureDate - now) / (1000 * 60 * 60);

        // Simple cancellation policy - this could be more complex
        let cancellationCharges = 0;
        if (hoursBeforeDeparture < 24) {
            cancellationCharges = booking.pricing.totalAmount * 0.5; // 50% charges
        } else if (hoursBeforeDeparture < 48) {
            cancellationCharges = booking.pricing.totalAmount * 0.25; // 25% charges
        }

        updateData['cancellation.cancellationCharges'] = cancellationCharges;
        updateData['cancellation.refundEligible'] = cancellationCharges < booking.pricing.totalAmount;

        return await this.updateById(id, updateData);
    }

    async getBookingsByDateRange(startDate, endDate) {
        return await travelBookingRepository.findByDateRange(startDate, endDate);
    }

    async getBookingStats() {
        return await travelBookingRepository.getBookingStats();
    }
}

export default new TravelBookingService();
