import trainService from '../../../services/train.service.js';

export class TrainController {
    async getTrains(req, res, next) {
        try {
            const trains = await trainService.getAll();
            res.status(200).json(trains);
        } catch (err) {
            next(err);
        }
    }

    async getPaginatedTrains(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await trainService.getPaginatedTrains(page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async createTrain(req, res, next) {
        try {
            const newTrain = await trainService.createTrain(req.body);
            res.status(201).json(newTrain);
        } catch (err) {
            next(err);
        }
    }

    async getTrain(req, res, next) {
        try {
            const train = await trainService.getById(req.params.id);
            if (!train) return res.status(404).json({ message: "Train not found" });
            res.status(200).json(train);
        } catch (err) {
            next(err);
        }
    }

    async updateTrain(req, res, next) {
        try {
            const updatedTrain = await trainService.updateTrain(req.params.id, req.body);
            if (!updatedTrain) return res.status(404).json({ message: "Train not found" });
            res.status(200).json(updatedTrain);
        } catch (err) {
            next(err);
        }
    }

    async deleteTrain(req, res, next) {
        try {
            await trainService.deleteById(req.params.id);
            res.status(200).json({ message: "Train deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async searchTrains(req, res, next) {
        try {
            const {from: origin, to: destination, date, class: trainClass } = req.query;
            const trains = await trainService.searchTrains(origin, destination, date, trainClass);
            res.status(200).json(trains);
        } catch (err) {
            next(err);
        }
    }

    async getTrainsByType(req, res, next) {
        try {
            const { trainType } = req.params;
            const trains = await trainService.getTrainsByType(trainType);
            res.status(200).json(trains);
        } catch (err) {
            next(err);
        }
    }

    async updateTrainStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedTrain = await trainService.updateTrainStatus(id, status);
            if (!updatedTrain) return res.status(404).json({ message: "Train not found" });
            res.status(200).json(updatedTrain);
        } catch (err) {
            next(err);
        }
    }

    async getTrainSchedule(req, res, next) {
        try {
            const { id } = req.params;
            const schedule = await trainService.getTrainSchedule(id);
            if (!schedule) return res.status(404).json({ message: "Train schedule not found" });
            res.status(200).json(schedule);
        } catch (err) {
            next(err);
        }
    }

    async getAvailableSeats(req, res, next) {
        try {
            const { id } = req.params;
            const { date, class: trainClass } = req.query;
            const availableSeats = await trainService.getAvailableSeats(id, date, trainClass);
            res.status(200).json(availableSeats);
        } catch (err) {
            next(err);
        }
    }
}

export default new TrainController();
