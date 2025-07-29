import BaseService from './base/base.service.js';
import busRepository from '../repositories/bus.repository.js';

export class BusService extends BaseService {
    constructor() {
        super(busRepository);
    }

    async createBus(busData) {
        // Validate required fields
        if (!busData.busNumber || !busData.operator?.name || !busData.busType) {
            throw new Error('Bus number, operator name, and bus type are required');
        }

        // Check if bus number already exists
        const existingBus = await busRepository.findByBusNumber(busData.busNumber);
        if (existingBus) {
            throw new Error('Bus number already exists');
        }

        // Handle route origin and destination
        const processedBusData = { ...busData };

        // Sanitize seating configuration - convert empty string to empty array
        if (processedBusData.seating && processedBusData.seating.seatConfiguration === '') {
            processedBusData.seating.seatConfiguration = [];
        }

        // If origin/destination are provided as strings, find or create destination records
        if (busData.route) {
            if (typeof busData.route.origin === 'string' && busData.route.origin.trim()) {
                const originDestination = await this.findOrCreateDestination(busData.route.origin, 'bus_station');
                processedBusData.route.origin = originDestination._id;
            } else if (!busData.route.origin || busData.route.origin === '') {
                // Set default origin if empty
                const defaultOrigin = await this.findOrCreateDestination('Delhi', 'bus_station');
                processedBusData.route.origin = defaultOrigin._id;
            }

            if (typeof busData.route.destination === 'string' && busData.route.destination.trim()) {
                const destinationDestination = await this.findOrCreateDestination(busData.route.destination, 'bus_station');
                processedBusData.route.destination = destinationDestination._id;
            } else if (!busData.route.destination || busData.route.destination === '') {
                // Set default destination if empty
                const defaultDestination = await this.findOrCreateDestination('Mumbai', 'bus_station');
                processedBusData.route.destination = defaultDestination._id;
            }
        } else {
            // Set default route if not provided
            const defaultOrigin = await this.findOrCreateDestination('Delhi', 'bus_station');
            const defaultDestination = await this.findOrCreateDestination('Mumbai', 'bus_station');
            processedBusData.route = {
                origin: defaultOrigin._id,
                destination: defaultDestination._id
            };
        }

        // Set default schedule duration if not provided
        if (!processedBusData.schedule?.duration) {
            processedBusData.schedule = {
                ...processedBusData.schedule,
                duration: 480 // Default 8 hours
            };
        }

        // Validate schedule dates
        if (processedBusData.schedule?.validFrom && processedBusData.schedule?.validTo) {
            const validFrom = new Date(processedBusData.schedule.validFrom);
            const validTo = new Date(processedBusData.schedule.validTo);
            if (validFrom >= validTo) {
                throw new Error('Valid from date must be before valid to date');
            }
        }

        return await this.create(processedBusData);
    }

    async findOrCreateDestination(cityName, type = 'bus_station') {
        const Destination = (await import('../models/Destination.js')).default;

        // Try to find existing destination by city name
        let destination = await Destination.findOne({
            city: { $regex: cityName, $options: 'i' },
            type: type
        });

        if (!destination) {
            // Create new destination with type-specific code to avoid duplicates
            const baseCode = cityName.substring(0, 3).toUpperCase();
            const typePrefix = type === 'bus_station' ? 'B' : type === 'railway_station' ? 'R' : 'A';
            const code = `${typePrefix}${baseCode}`;

            destination = await Destination.create({
                name: `${cityName} ${type === 'bus_station' ? 'Bus Station' : 'Station'}`,
                code: code,
                city: cityName,
                state: 'Unknown',
                country: 'India',
                type: type,
                isActive: true
            });
        }

        return destination;
    }

    async updateBus(id, busData) {
        const bus = await this.getById(id);
        if (!bus) {
            throw new Error('Bus not found');
        }

        // If bus number is being updated, check for duplicates
        if (busData.busNumber && busData.busNumber !== bus.busNumber) {
            const existingBus = await busRepository.findByBusNumber(busData.busNumber);
            if (existingBus) {
                throw new Error('Bus number already exists');
            }
        }

        return await this.updateById(id, busData);
    }

    async getPaginatedBuses(page, limit) {
        return await busRepository.getPaginated(page, limit);
    }

    async searchBuses(origin, destination, date) {
        if (!origin || !destination) {
            throw new Error('Origin and destination are required for search');
        }

        return await busRepository.searchBuses(origin, destination, date);
    }

    async getBusesByOperator(operatorCode) {
        return await busRepository.findByOperatorCode(operatorCode);
    }

    async updateBusStatus(id, status) {
        const validStatuses = ['active', 'inactive', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status. Must be one of: active, inactive, cancelled');
        }

        return await this.updateById(id, { status });
    }

    async getBusesByRoute(origin, destination) {
        return await busRepository.findByRoute(origin, destination);
    }

    async getAvailableSeats(busId, date) {
        const bus = await this.getById(busId);
        if (!bus) {
            throw new Error('Bus not found');
        }

        // This would typically check against bookings to determine available seats
        return await busRepository.getAvailableSeats(busId, date);
    }

    async validateBusData(busData) {
        const errors = [];

        if (!busData.busNumber) errors.push('Bus number is required');
        if (!busData.operator?.name) errors.push('Operator name is required');
        if (!busData.busType) errors.push('Bus type is required');
        if (!busData.seating?.totalSeats || busData.seating.totalSeats <= 0) {
            errors.push('Total seats must be a positive number');
        }
        if (!busData.basePrice || busData.basePrice <= 0) {
            errors.push('Base price must be a positive number');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        return true;
    }
}

export default new BusService();
