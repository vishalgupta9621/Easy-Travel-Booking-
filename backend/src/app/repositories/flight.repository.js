import BaseRepository from './base/base.repository.js';
import Flight from '../models/Flight.js';

export class FlightRepository extends BaseRepository {
    constructor() {
        super(Flight);
    }

    async findByFlightNumber(flightNumber) {
        return this.model.findOne({ flightNumber });
    }

    async findByAirlineCode(airlineCode) {
        return this.model.find({ 'airline.code': airlineCode });
    }

    async findByRoute(origin, destination) {
        return this.model.find({
            'route.origin': origin,
            'route.destination': destination
        }).populate('route.origin route.destination');
    }

    async searchFlights(origin, destination, date, flightClass = 'economy') {
        const query = {
            'route.origin': origin,
            'route.destination': destination,
            status: 'active'
        };

        if (date) {
            const searchDate = new Date(date);
            query['schedule.validFrom'] = { $lte: searchDate };
            query['schedule.validTo'] = { $gte: searchDate };
        }

        // Ensure the requested class has available seats
        if (flightClass === 'economy') {
            query['pricing.economy.totalSeats'] = { $gt: 0 };
        } else if (flightClass === 'business') {
            query['pricing.business.totalSeats'] = { $gt: 0 };
        } else if (flightClass === 'first') {
            query['pricing.first.totalSeats'] = { $gt: 0 };
        }

        return this.model.find(query)
            .populate('route.origin route.destination')
            .sort({ 'schedule.departureTime': 1 });
    }

    async getPaginated(page, limit) {
        const skip = (page - 1) * limit;
        
        const flights = await this.model.find()
            .populate('route.origin route.destination')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await this.model.countDocuments();
        const pages = Math.ceil(total / limit);

        return {
            flights,
            pagination: {
                total,
                page,
                limit,
                pages
            }
        };
    }

    async getAvailableSeats(flightId, date, flightClass = 'economy') {
        const flight = await this.model.findById(flightId);
        if (!flight) return null;

        // This would typically involve checking against bookings
        // For now, return the flight pricing configuration
        const classInfo = flight.pricing[flightClass];
        if (!classInfo) return null;

        return {
            class: flightClass,
            totalSeats: classInfo.totalSeats,
            availableSeats: classInfo.totalSeats, // This should be calculated based on bookings
            basePrice: classInfo.basePrice,
            taxes: classInfo.taxes
        };
    }

    async getFlightsByStatus(status) {
        return this.model.find({ status });
    }

    async getFlightsByAircraft(aircraftModel) {
        return this.model.find({ 'aircraft.model': aircraftModel });
    }

    async updateStatus(id, status) {
        return this.model.findByIdAndUpdate(
            id, 
            { status, updatedAt: new Date() }, 
            { new: true }
        );
    }

    async getFlightStats() {
        return this.model.aggregate([
            {
                $group: {
                    _id: '$airline.code',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$pricing.economy.basePrice' }
                }
            },
            { $sort: { count: -1 } }
        ]);
    }
}

export default new FlightRepository();
