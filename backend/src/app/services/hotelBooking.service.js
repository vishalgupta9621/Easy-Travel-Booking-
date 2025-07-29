import BaseService from './base/base.service.js';
import hotelBookingRepository from '../repositories/hotelBooking.repository.js';

export class HotelBookingService extends BaseService {
    constructor() {
        super(hotelBookingRepository);
    }

    async createBooking(bookingData) {
        // Validate required fields
        if (!bookingData.userId || !bookingData.hotelId || !bookingData.roomId) {
            throw new Error('User ID, hotel ID, and room ID are required');
        }

        // Validate dates
        if (!bookingData.checkIn || !bookingData.checkOut) {
            throw new Error('Check-in and check-out dates are required');
        }

        const checkInDate = new Date(bookingData.checkIn);
        const checkOutDate = new Date(bookingData.checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            throw new Error('Check-in date cannot be in the past');
        }

        if (checkOutDate <= checkInDate) {
            throw new Error('Check-out date must be after check-in date');
        }

        // Validate guest details
        if (!bookingData.guestDetails?.primaryGuest?.firstName || 
            !bookingData.guestDetails?.primaryGuest?.lastName ||
            !bookingData.guestDetails?.primaryGuest?.email ||
            !bookingData.guestDetails?.primaryGuest?.phone) {
            throw new Error('Primary guest details (name, email, phone) are required');
        }

        // Validate guest count
        if (!bookingData.adults || bookingData.adults <= 0) {
            throw new Error('At least one adult is required');
        }

        // Validate pricing
        if (!bookingData.pricing?.totalPrice || bookingData.pricing.totalPrice <= 0) {
            throw new Error('Total price must be positive');
        }

        // Validate payment details
        if (!bookingData.payment?.method || !bookingData.payment?.transactionId) {
            throw new Error('Payment method and transaction ID are required');
        }

        // Check room availability
        const isAvailable = await this.checkRoomAvailability(
            bookingData.hotelId, 
            bookingData.roomId, 
            bookingData.checkIn, 
            bookingData.checkOut
        );

        if (!isAvailable) {
            throw new Error('Room is not available for the selected dates');
        }

        return await this.create(bookingData);
    }

    async updateBooking(id, bookingData) {
        const booking = await this.getById(id);
        if (!booking) {
            throw new Error('Hotel booking not found');
        }

        // Prevent updating certain fields after check-in
        if (booking.status === 'checked_in' || booking.status === 'checked_out' || booking.status === 'completed') {
            const restrictedFields = ['hotelId', 'roomId', 'checkIn', 'checkOut'];
            const hasRestrictedUpdates = restrictedFields.some(field => bookingData[field]);
            
            if (hasRestrictedUpdates) {
                throw new Error('Cannot update booking details after check-in');
            }
        }

        return await this.updateById(id, bookingData);
    }

    async getPaginatedBookings(page, limit) {
        return await hotelBookingRepository.getPaginated(page, limit);
    }

    async getBookingsByUser(userId) {
        return await hotelBookingRepository.findByUserId(userId);
    }

    async getBookingsByHotel(hotelId) {
        return await hotelBookingRepository.findByHotelId(hotelId);
    }

    async updateBookingStatus(id, status) {
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'checked_in', 'checked_out'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        const booking = await this.getById(id);
        if (!booking) {
            throw new Error('Hotel booking not found');
        }

        // Validate status transitions
        if (booking.status === 'completed' && status !== 'completed') {
            throw new Error('Cannot change status of completed booking');
        }

        if (booking.status === 'cancelled' && status !== 'cancelled') {
            throw new Error('Cannot change status of cancelled booking');
        }

        if (status === 'checked_in' && booking.status !== 'confirmed') {
            throw new Error('Can only check-in confirmed bookings');
        }

        if (status === 'checked_out' && booking.status !== 'checked_in') {
            throw new Error('Can only check-out checked-in bookings');
        }

        return await this.updateById(id, { status });
    }

    async updatePaymentStatus(id, paymentStatus, transactionId) {
        const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validPaymentStatuses.includes(paymentStatus)) {
            throw new Error('Invalid payment status');
        }

        const updateData = {
            'payment.paymentStatus': paymentStatus
        };

        if (transactionId) {
            updateData['payment.transactionId'] = transactionId;
        }

        return await this.updateById(id, updateData);
    }

    async checkIn(id) {
        const booking = await this.getById(id);
        if (!booking) {
            throw new Error('Hotel booking not found');
        }

        if (booking.status !== 'confirmed') {
            throw new Error('Can only check-in confirmed bookings');
        }

        const today = new Date();
        const checkInDate = new Date(booking.checkIn);
        
        if (today < checkInDate) {
            throw new Error('Cannot check-in before check-in date');
        }

        return await this.updateById(id, { status: 'checked_in' });
    }

    async checkOut(id) {
        const booking = await this.getById(id);
        if (!booking) {
            throw new Error('Hotel booking not found');
        }

        if (booking.status !== 'checked_in') {
            throw new Error('Can only check-out checked-in bookings');
        }

        return await this.updateById(id, { status: 'checked_out' });
    }

    async checkRoomAvailability(hotelId, roomId, checkIn, checkOut) {
        return await hotelBookingRepository.checkRoomAvailability(hotelId, roomId, checkIn, checkOut);
    }

    async getBookingsByDateRange(startDate, endDate) {
        return await hotelBookingRepository.findByDateRange(startDate, endDate);
    }

    async getHotelOccupancy(hotelId, date) {
        return await hotelBookingRepository.getHotelOccupancy(hotelId, date);
    }

    async getBookingStats() {
        return await hotelBookingRepository.getBookingStats();
    }
}

export default new HotelBookingService();
