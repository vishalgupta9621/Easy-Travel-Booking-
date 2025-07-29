import BaseService from './base/base.service.js';
import flightRepository from '../repositories/flight.repository.js';

export class FlightService extends BaseService {
    constructor() {
        super(flightRepository);
    }

    async createFlight(flightData) {
        // Validate required fields
        if (!flightData.flightNumber || !flightData.airline?.name || !flightData.airline?.code) {
            throw new Error('Flight number, airline name, and airline code are required');
        }

        // Check if flight number already exists
        const existingFlight = await flightRepository.findByFlightNumber(flightData.flightNumber);
        if (existingFlight) {
            throw new Error('Flight number already exists');
        }

        // Handle route origin and destination
        const processedFlightData = { ...flightData };
if (!flightData.route || !flightData.route.origin || !flightData.route.destination) {
    throw new Error('Route origin and destination are required');
}

        // If origin/destination are provided as strings, find or create destination records
        if (flightData.route) {
            if (typeof flightData.route.origin === 'string' && flightData.route.origin) {
                const originDestination = await this.findOrCreateDestination(flightData.route.origin, 'airport');
                processedFlightData.route.origin = originDestination._id;
            }

            if (typeof flightData.route.destination === 'string' && flightData.route.destination) {
                const destinationDestination = await this.findOrCreateDestination(flightData.route.destination, 'airport');
                processedFlightData.route.destination = destinationDestination._id;
            }
        }

        // Set default schedule values if not provided
        if (!processedFlightData.schedule) {
            processedFlightData.schedule = {};
        }

        const schedule = processedFlightData.schedule;
        if (!schedule.duration) schedule.duration = 120; // Default 2 hours
        if (!schedule.departureTime) schedule.departureTime = "09:00";
        if (!schedule.arrivalTime) schedule.arrivalTime = "11:00";
        if (!schedule.validFrom) schedule.validFrom = new Date();
        if (!schedule.validTo) {
            const validTo = new Date();
            validTo.setFullYear(validTo.getFullYear() + 1); // Valid for 1 year
            schedule.validTo = validTo;
        }

        // Set default aircraft values if not provided
        if (!processedFlightData.aircraft) {
            processedFlightData.aircraft = {};
        }
        if (!processedFlightData.aircraft.capacity) {
            processedFlightData.aircraft.capacity = 180; // Default capacity
        }
        if (!processedFlightData.aircraft.model) {
            processedFlightData.aircraft.model = "Boeing 737";
        }

        // Set default pricing values if not provided
        if (!processedFlightData.pricing) {
            processedFlightData.pricing = {};
        }
        if (!processedFlightData.pricing.economy) {
            processedFlightData.pricing.economy = {};
        }
        if (!processedFlightData.pricing.economy.totalSeats) {
            processedFlightData.pricing.economy.totalSeats = 150;
        }
        if (!processedFlightData.pricing.economy.availableSeats) {
            processedFlightData.pricing.economy.availableSeats = processedFlightData.pricing.economy.totalSeats;
        }

        // Validate schedule dates
        if (processedFlightData.schedule?.validFrom && processedFlightData.schedule?.validTo) {
            const validFrom = new Date(processedFlightData.schedule.validFrom);
            const validTo = new Date(processedFlightData.schedule.validTo);
            if (validFrom >= validTo) {
                throw new Error('Valid from date must be before valid to date');
            }
        }

        // Validate pricing
        if (!processedFlightData.pricing?.economy?.basePrice || processedFlightData.pricing.economy.basePrice <= 0) {
            throw new Error('Economy base price is required and must be positive');
        }

        return await this.create(processedFlightData);
    }

    async findOrCreateDestination(cityName, type = 'airport') {
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
                name: `${cityName} ${type === 'airport' ? 'Airport' : 'Station'}`,
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

    async updateFlight(id, flightData) {
        const flight = await this.getById(id);
        if (!flight) {
            throw new Error('Flight not found');
        }

        // If flight number is being updated, check for duplicates
        if (flightData.flightNumber && flightData.flightNumber !== flight.flightNumber) {
            const existingFlight = await flightRepository.findByFlightNumber(flightData.flightNumber);
            if (existingFlight) {
                throw new Error('Flight number already exists');
            }
        }

        return await this.updateById(id, flightData);
    }

    async getPaginatedFlights(page, limit) {
        return await flightRepository.getPaginated(page, limit);
    }

    async searchFlights(origin, destination, date, flightClass = 'economy') {
        if (!origin || !destination) {
            throw new Error('Origin and destination are required for search');
        }

        return await flightRepository.searchFlights(origin, destination, date, flightClass);
    }

    async getFlightsByAirline(airlineCode) {
        return await flightRepository.findByAirlineCode(airlineCode);
    }

    async updateFlightStatus(id, status) {
        const validStatuses = ['active', 'inactive', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status. Must be one of: active, inactive, cancelled');
        }

        return await this.updateById(id, { status });
    }

    async getFlightsByRoute(origin, destination) {
        return await flightRepository.findByRoute(origin, destination);
    }

    async getAvailableSeats(flightId, date, flightClass = 'economy') {
        const flight = await this.getById(flightId);
        if (!flight) {
            throw new Error('Flight not found');
        }

        const validClasses = ['economy', 'business', 'first'];
        if (!validClasses.includes(flightClass)) {
            throw new Error('Invalid flight class. Must be one of: economy, business, first');
        }

        // This would typically check against bookings to determine available seats
        return await flightRepository.getAvailableSeats(flightId, date, flightClass);
    }

    async getFlightSchedule(flightId) {
        const flight = await this.getById(flightId);
        if (!flight) {
            throw new Error('Flight not found');
        }

        return {
            flightNumber: flight.flightNumber,
            airline: flight.airline,
            route: flight.route,
            schedule: flight.schedule,
            stops: flight.route.stops || []
        };
    }

    async validateFlightData(flightData) {
        const errors = [];

        if (!flightData.flightNumber) errors.push('Flight number is required');
        if (!flightData.airline?.name) errors.push('Airline name is required');
        if (!flightData.airline?.code) errors.push('Airline code is required');
        if (!flightData.aircraft?.capacity || flightData.aircraft.capacity <= 0) {
            errors.push('Aircraft capacity must be a positive number');
        }
        if (!flightData.pricing?.economy?.basePrice || flightData.pricing.economy.basePrice <= 0) {
            errors.push('Economy base price must be a positive number');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        return true;
    }
}

export default new FlightService();
