import travelBookingService from '../../../services/travelBooking.service.js';

export class TravelBookingController {
    async getTravelBookings(req, res, next) {
        try {
            const bookings = await travelBookingService.getAll();
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async getPaginatedTravelBookings(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await travelBookingService.getPaginatedBookings(page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async createTravelBooking(req, res, next) {
        try {
            const newBooking = await travelBookingService.createBooking(req.body);
            res.status(201).json(newBooking);
        } catch (err) {
            next(err);
        }
    }

    async getTravelBooking(req, res, next) {
        try {
            const booking = await travelBookingService.getById(req.params.id);
            if (!booking) return res.status(404).json({ message: "Travel booking not found" });
            res.status(200).json(booking);
        } catch (err) {
            next(err);
        }
    }

    async updateTravelBooking(req, res, next) {
        try {
            const updatedBooking = await travelBookingService.updateBooking(req.params.id, req.body);
            if (!updatedBooking) return res.status(404).json({ message: "Travel booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async deleteTravelBooking(req, res, next) {
        try {
            await travelBookingService.deleteById(req.params.id);
            res.status(200).json({ message: "Travel booking deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getBookingsByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const bookings = await travelBookingService.getBookingsByUser(userId);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async getBookingsByType(req, res, next) {
        try {
            const { travelType } = req.params;
            const bookings = await travelBookingService.getBookingsByType(travelType);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async updateBookingStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedBooking = await travelBookingService.updateBookingStatus(id, status);
            if (!updatedBooking) return res.status(404).json({ message: "Travel booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async updatePaymentStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { paymentStatus, transactionId } = req.body;
            const updatedBooking = await travelBookingService.updatePaymentStatus(id, paymentStatus, transactionId);
            if (!updatedBooking) return res.status(404).json({ message: "Travel booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async cancelBooking(req, res, next) {
        try {
            const { id } = req.params;
            const { cancellationReason } = req.body;
            const cancelledBooking = await travelBookingService.cancelBooking(id, cancellationReason);
            if (!cancelledBooking) return res.status(404).json({ message: "Travel booking not found" });
            res.status(200).json(cancelledBooking);
        } catch (err) {
            next(err);
        }
    }

    async getBookingsByDateRange(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const bookings = await travelBookingService.getBookingsByDateRange(startDate, endDate);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }
}

export default new TravelBookingController();
