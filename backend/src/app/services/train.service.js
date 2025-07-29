import BaseService from './base/base.service.js';
import trainRepository from '../repositories/train.repository.js';

export class TrainService extends BaseService {
    constructor() {
        super(trainRepository);
    }

    async createTrain(trainData) {
        // Validate required fields
        if (!trainData.trainNumber || !trainData.trainName || !trainData.trainType || trainData.trainType.trim() === '') {
            throw new Error('Train number, train name, and train type are required');
        }

        // Check if train number already exists
        const existingTrain = await trainRepository.findByTrainNumber(trainData.trainNumber);
        if (existingTrain) {
            throw new Error('Train number already exists');
        }

        // Handle route origin and destination
        const processedTrainData = { ...trainData };

        // Sanitize data - convert empty strings to appropriate defaults
        if (processedTrainData.classes === '' || !processedTrainData.classes) {
            processedTrainData.classes = [];
        }

        // If origin/destination are provided as strings, find or create destination records
        if (trainData.route) {
            if (typeof trainData.route.origin === 'string' && trainData.route.origin.trim()) {
                const originDestination = await this.findOrCreateDestination(trainData.route.origin, 'railway_station');
                processedTrainData.route.origin = originDestination._id;
            } else if (!trainData.route.origin || trainData.route.origin === '') {
                // Set default origin if empty
                const defaultOrigin = await this.findOrCreateDestination('Delhi', 'railway_station');
                processedTrainData.route.origin = defaultOrigin._id;
            }

            if (typeof trainData.route.destination === 'string' && trainData.route.destination.trim()) {
                const destinationDestination = await this.findOrCreateDestination(trainData.route.destination, 'railway_station');
                processedTrainData.route.destination = destinationDestination._id;
            } else if (!trainData.route.destination || trainData.route.destination === '') {
                // Set default destination if empty
                const defaultDestination = await this.findOrCreateDestination('Mumbai', 'railway_station');
                processedTrainData.route.destination = defaultDestination._id;
            }
        } else {
            // Set default route if not provided
            const defaultOrigin = await this.findOrCreateDestination('Delhi', 'railway_station');
            const defaultDestination = await this.findOrCreateDestination('Mumbai', 'railway_station');
            processedTrainData.route = {
                origin: defaultOrigin._id,
                destination: defaultDestination._id
            };
        }

        // Set default schedule duration if not provided
        if (!processedTrainData.schedule?.duration) {
            processedTrainData.schedule = {
                ...processedTrainData.schedule,
                duration: 720 // Default 12 hours
            };
        }

        // Validate schedule dates
        if (processedTrainData.schedule?.validFrom && processedTrainData.schedule?.validTo) {
            const validFrom = new Date(processedTrainData.schedule.validFrom);
            const validTo = new Date(processedTrainData.schedule.validTo);
            if (validFrom >= validTo) {
                throw new Error('Valid from date must be before valid to date');
            }
        }

        // Set default classes if not provided
        if (!processedTrainData.classes || processedTrainData.classes.length === 0) {
            processedTrainData.classes = [
                {
                    name: 'Sleeper',
                    code: 'SL',
                    basePrice: 500,
                    totalSeats: 72,
                    availableSeats: 72
                }
            ];
        }

        return await this.create(processedTrainData);
    }

    async findOrCreateDestination(cityName, type = 'railway_station') {
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
                name: `${cityName} ${type === 'railway_station' ? 'Railway Station' : 'Station'}`,
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

    async updateTrain(id, trainData) {
        const train = await this.getById(id);
        if (!train) {
            throw new Error('Train not found');
        }

        // If train number is being updated, check for duplicates
        if (trainData.trainNumber && trainData.trainNumber !== train.trainNumber) {
            const existingTrain = await trainRepository.findByTrainNumber(trainData.trainNumber);
            if (existingTrain) {
                throw new Error('Train number already exists');
            }
        }

        return await this.updateById(id, trainData);
    }

    async getPaginatedTrains(page, limit) {
        return await trainRepository.getPaginated(page, limit);
    }

    async searchTrains(origin, destination, date, trainClass) {
        if (!origin || !destination) {
            throw new Error('Origin and destination are required for search');
        }

        return await trainRepository.searchTrains(origin, destination, date, trainClass);
    }

    async getTrainsByType(trainType) {
        const validTypes = ['express', 'superfast', 'passenger', 'local', 'rajdhani', 'shatabdi', 'duronto'];
        if (!validTypes.includes(trainType)) {
            throw new Error('Invalid train type');
        }

        return await trainRepository.findByTrainType(trainType);
    }

    async updateTrainStatus(id, status) {
        const validStatuses = ['active', 'inactive', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status. Must be one of: active, inactive, cancelled');
        }

        return await this.updateById(id, { status });
    }

    async getTrainsByRoute(origin, destination) {
        return await trainRepository.findByRoute(origin, destination);
    }

    async getTrainSchedule(trainId) {
        const train = await this.getById(trainId);
        if (!train) {
            throw new Error('Train not found');
        }

        return {
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            trainType: train.trainType,
            route: train.route,
            schedule: train.schedule,
            stations: train.route.stations || []
        };
    }

    async getAvailableSeats(trainId, date, trainClass) {
        const train = await this.getById(trainId);
        if (!train) {
            throw new Error('Train not found');
        }

        // Validate train class exists
        const classExists = train.classes.some(cls => cls.code === trainClass);
        if (!classExists) {
            throw new Error('Invalid train class for this train');
        }

        // This would typically check against bookings to determine available seats
        return await trainRepository.getAvailableSeats(trainId, date, trainClass);
    }

    async addTrainClass(trainId, classData) {
        const train = await this.getById(trainId);
        if (!train) {
            throw new Error('Train not found');
        }

        // Validate class data
        if (!classData.name || !classData.code || !classData.basePrice || !classData.totalSeats) {
            throw new Error('Class name, code, base price, and total seats are required');
        }

        // Check if class code already exists for this train
        const classExists = train.classes.some(cls => cls.code === classData.code);
        if (classExists) {
            throw new Error('Class code already exists for this train');
        }

        train.classes.push(classData);
        return await this.updateById(trainId, { classes: train.classes });
    }

    async validateTrainData(trainData) {
        const errors = [];

        if (!trainData.trainNumber) errors.push('Train number is required');
        if (!trainData.trainName) errors.push('Train name is required');
        if (!trainData.trainType) errors.push('Train type is required');
        
        const validTypes = ['express', 'superfast', 'passenger', 'local', 'rajdhani', 'shatabdi', 'duronto'];
        if (trainData.trainType && !validTypes.includes(trainData.trainType)) {
            errors.push('Invalid train type');
        }

        if (!trainData.classes || trainData.classes.length === 0) {
            errors.push('At least one class must be defined');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        return true;
    }
}

export default new TrainService();
