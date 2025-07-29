import flightService from '../../../services/flight.service.js';

export class FlightController {
    async getFlights(req, res, next) {
        try {
            const flights = await flightService.getAll();
            res.status(200).json(flights);
        } catch (err) {
            next(err);
        }
    }

    async getPaginatedFlights(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await flightService.getPaginatedFlights(page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async createFlight(req, res, next) {
        try {
            const newFlight = await flightService.createFlight(req.body);
            res.status(201).json(newFlight);
        } catch (err) {
            next(err);
        }
    }

    async getFlight(req, res, next) {
        try {
            const flight = await flightService.getById(req.params.id);
            if (!flight) return res.status(404).json({ message: "Flight not found" });
            res.status(200).json(flight);
        } catch (err) {
            next(err);
        }
    }

    async updateFlight(req, res, next) {
        try {
            const updatedFlight = await flightService.updateFlight(req.params.id, req.body);
            if (!updatedFlight) return res.status(404).json({ message: "Flight not found" });
            res.status(200).json(updatedFlight);
        } catch (err) {
            next(err);
        }
    }

    async deleteFlight(req, res, next) {
        try {
            await flightService.deleteById(req.params.id);
            res.status(200).json({ message: "Flight deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async searchFlights(req, res, next) {
        try {
      const { from: origin, to: destination, departureDate: date, class: flightClass } = req.query;
            const flights = await flightService.searchFlights(origin, destination, date, flightClass);
            res.status(200).json(flights);
        } catch (err) {
            next(err);
        }
    }

    async getFlightsByAirline(req, res, next) {
        try {
            const { airlineCode } = req.params;
            const flights = await flightService.getFlightsByAirline(airlineCode);
            res.status(200).json(flights);
        } catch (err) {
            next(err);
        }
    }

    async updateFlightStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedFlight = await flightService.updateFlightStatus(id, status);
            if (!updatedFlight) return res.status(404).json({ message: "Flight not found" });
            res.status(200).json(updatedFlight);
        } catch (err) {
            next(err);
        }
    }

    async getAvailableSeats(req, res, next) {
        try {
            const { id } = req.params;
            const { date, class: flightClass } = req.query;
            const availableSeats = await flightService.getAvailableSeats(id, date, flightClass);
            res.status(200).json(availableSeats);
        } catch (err) {
            next(err);
        }
    }
}

export default new FlightController();
