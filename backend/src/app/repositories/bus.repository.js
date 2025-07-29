import BaseRepository from './base/base.repository.js';
import Bus from '../models/Bus.js';

export class BusRepository extends BaseRepository {
    constructor() {
        super(Bus);
    }

    async findByBusNumber(busNumber) {
        return this.model.findOne({ busNumber });
    }

    async findByOperatorCode(operatorCode) {
        return this.model.find({ 'operator.code': operatorCode });
    }

    async findByRoute(origin, destination) {
        return this.model.find({
            'route.origin': origin,
            'route.destination': destination
        }).populate('route.origin route.destination');
    }

    async searchBuses(origin, destination, date) {
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

        return this.model.find(query)
            .populate('route.origin route.destination')
            .sort({ 'schedule.departureTime': 1 });
    }

    async getPaginated(page, limit) {
        const skip = (page - 1) * limit;
        
        const buses = await this.model.find()
            .populate('route.origin route.destination')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await this.model.countDocuments();
        const pages = Math.ceil(total / limit);

        return {
            buses,
            pagination: {
                total,
                page,
                limit,
                pages
            }
        };
    }

    async getAvailableSeats(busId, date) {
        // This would typically involve checking against bookings
        // For now, return the bus seating configuration
        const bus = await this.model.findById(busId);
        if (!bus) return null;

        return {
            totalSeats: bus.seating.totalSeats,
            availableSeats: bus.seating.totalSeats, // This should be calculated based on bookings
            seatConfiguration: bus.seating.seatConfiguration
        };
    }

    async getBusesByStatus(status) {
        return this.model.find({ status });
    }

    async getBusesByType(busType) {
        return this.model.find({ busType });
    }

    async updateStatus(id, status) {
        return this.model.findByIdAndUpdate(
            id, 
            { status, updatedAt: new Date() }, 
            { new: true }
        );
    }
}

export default new BusRepository();
