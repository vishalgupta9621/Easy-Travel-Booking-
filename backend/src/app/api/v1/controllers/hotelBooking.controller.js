import hotelBookingService from '../../../services/hotelBooking.service.js';

export class HotelBookingController {
    async getHotelBookings(req, res, next) {
        try {
            const bookings = await hotelBookingService.getAll();
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async getPaginatedHotelBookings(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await hotelBookingService.getPaginatedBookings(page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async createHotelBooking(req, res, next) {
        try {
            const newBooking = await hotelBookingService.createBooking(req.body);
            res.status(201).json(newBooking);
        } catch (err) {
            next(err);
        }
    }

    async getHotelBooking(req, res, next) {
        try {
            const booking = await hotelBookingService.getById(req.params.id);
            if (!booking) return res.status(404).json({ message: "Hotel booking not found" });
            res.status(200).json(booking);
        } catch (err) {
            next(err);
        }
    }

    async updateHotelBooking(req, res, next) {
        try {
            const updatedBooking = await hotelBookingService.updateBooking(req.params.id, req.body);
            if (!updatedBooking) return res.status(404).json({ message: "Hotel booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async deleteHotelBooking(req, res, next) {
        try {
            await hotelBookingService.deleteById(req.params.id);
            res.status(200).json({ message: "Hotel booking deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async getBookingsByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const bookings = await hotelBookingService.getBookingsByUser(userId);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async getBookingsByHotel(req, res, next) {
        try {
            const { hotelId } = req.params;
            const bookings = await hotelBookingService.getBookingsByHotel(hotelId);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }

    async updateBookingStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedBooking = await hotelBookingService.updateBookingStatus(id, status);
            if (!updatedBooking) return res.status(404).json({ message: "Hotel booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async updatePaymentStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { paymentStatus, transactionId } = req.body;
            const updatedBooking = await hotelBookingService.updatePaymentStatus(id, paymentStatus, transactionId);
            if (!updatedBooking) return res.status(404).json({ message: "Hotel booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async checkIn(req, res, next) {
        try {
            const { id } = req.params;
            const updatedBooking = await hotelBookingService.checkIn(id);
            if (!updatedBooking) return res.status(404).json({ message: "Hotel booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async checkOut(req, res, next) {
        try {
            const { id } = req.params;
            const updatedBooking = await hotelBookingService.checkOut(id);
            if (!updatedBooking) return res.status(404).json({ message: "Hotel booking not found" });
            res.status(200).json(updatedBooking);
        } catch (err) {
            next(err);
        }
    }

    async getBookingsByDateRange(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const bookings = await hotelBookingService.getBookingsByDateRange(startDate, endDate);
            res.status(200).json(bookings);
        } catch (err) {
            next(err);
        }
    }
}

export default new HotelBookingController();
