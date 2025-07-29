import BaseRepository from './base/base.repository.js';
import Train from '../models/Train.js';

export class TrainRepository extends BaseRepository {
    constructor() {
        super(Train);
    }

    async findByTrainNumber(trainNumber) {
        return this.model.findOne({ trainNumber });
    }

    async findByTrainType(trainType) {
        return this.model.find({ trainType });
    }

    async findByRoute(origin, destination) {
        return this.model.find({
            'route.origin': origin,
            'route.destination': destination
        }).populate('route.origin route.destination');
    }

    async searchTrains(origin, destination, date, trainClass) {
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

        // Filter by class if specified
        if (trainClass) {
            query['classes.code'] = trainClass;
        }

        return this.model.find(query)
            .populate('route.origin route.destination')
            .sort({ 'schedule.departureTime': 1 });
    }

    async getPaginated(page, limit) {
        const skip = (page - 1) * limit;
        
        const trains = await this.model.find()
            .populate('route.origin route.destination')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await this.model.countDocuments();
        const pages = Math.ceil(total / limit);

        return {
            trains,
            pagination: {
                total,
                page,
                limit,
                pages
            }
        };
    }

    async getAvailableSeats(trainId, date, trainClass) {
        const train = await this.model.findById(trainId);
        if (!train) return null;

        // Find the specific class
        const classInfo = train.classes.find(cls => cls.code === trainClass);
        if (!classInfo) return null;

        // This would typically involve checking against bookings
        // For now, return the class configuration
        return {
            class: trainClass,
            className: classInfo.name,
            totalSeats: classInfo.totalSeats,
            availableSeats: classInfo.totalSeats, // This should be calculated based on bookings
            basePrice: classInfo.basePrice,
            amenities: classInfo.amenities
        };
    }

    async getTrainsByStatus(status) {
        return this.model.find({ status });
    }

    async getTrainsByOperatingDays(day) {
        return this.model.find({ 'schedule.operatingDays': day });
    }

    async updateStatus(id, status) {
        return this.model.findByIdAndUpdate(
            id, 
            { status, updatedAt: new Date() }, 
            { new: true }
        );
    }

    async getTrainStats() {
        return this.model.aggregate([
            {
                $group: {
                    _id: '$trainType',
                    count: { $sum: 1 },
                    avgClasses: { $avg: { $size: '$classes' } }
                }
            },
            { $sort: { count: -1 } }
        ]);
    }

    async getTrainsByRoute(origin, destination) {
        return this.model.find({
            $or: [
                { 'route.origin': origin, 'route.destination': destination },
                { 'route.stations.station': { $in: [origin, destination] } }
            ]
        }).populate('route.origin route.destination route.stations.station');
    }

    async addClassToTrain(trainId, classData) {
        return this.model.findByIdAndUpdate(
            trainId,
            { $push: { classes: classData } },
            { new: true }
        );
    }

    async removeClassFromTrain(trainId, classCode) {
        return this.model.findByIdAndUpdate(
            trainId,
            { $pull: { classes: { code: classCode } } },
            { new: true }
        );
    }
}

export default new TrainRepository();
