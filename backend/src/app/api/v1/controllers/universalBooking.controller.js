import universalBookingService from '../../../services/universalBooking.service.js';

export class UniversalBookingController {
    async getUniversalBookings(req, res, next) {
        try {
            const bookings = await universalBookingService.getAll();
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async getPaginatedUniversalBookings(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await universalBookingService.getPaginatedBookings(page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async createUniversalBooking(req, res, next) {
        try {
            const newBooking = await universalBookingService.createBooking(req.body);
            res.status(201).json(newBooking);
        } catch (err) {
            next(err);
        }
    }

    async getUniversalBooking(req, res, next) {
        try {
            const booking = await universalBookingService.getById(req.params.id);
            if (!booking) return res.status(404).json({ message: "Universal booking not found" });
            res.status(200).json(booking);
        } catch (err) {
            next(err);
        }
    }

    async updateUniversalBooking(req, res, next) {
        try {
            const updatedBooking = await universalBookingService.updateBooking(req.params.id, req.body);
            if (!updatedBooking) return res.status(404).json({ message: "Universal booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async deleteUniversalBooking(req, res, next) {
        try {
            await universalBookingService.deleteById(req.params.id);
            res.status(200).json({ message: "Universal booking deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getBookingsByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const bookings = await universalBookingService.getBookingsByUser(userId);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async getBookingsByType(req, res, next) {
        try {
            const { bookingType } = req.params;
            const bookings = await universalBookingService.getBookingsByType(bookingType);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async updateBookingStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedBooking = await universalBookingService.updateBookingStatus(id, status);
            if (!updatedBooking) return res.status(404).json({ message: "Universal booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async updatePaymentStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { paymentStatus, transactionId } = req.body;
            const updatedBooking = await universalBookingService.updatePaymentStatus(id, paymentStatus, transactionId);
            if (!updatedBooking) return res.status(404).json({ message: "Universal booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async getBookingsByDateRange(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const bookings = await universalBookingService.getBookingsByDateRange(startDate, endDate);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async getBookingStats(req, res, next) {
        try {
            const stats = await universalBookingService.getBookingStats();
            res.status(200).json(stats);
        } catch (err) {
            next(err);
        }
    }

    async searchBookings(req, res, next) {
        try {
            const { query, type, status } = req.query;
            const bookings = await universalBookingService.searchBookings(query, type, status);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }
}

export default new UniversalBookingController();
