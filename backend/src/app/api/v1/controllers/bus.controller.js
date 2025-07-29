import busService from '../../../services/bus.service.js';

export class BusController {
    async getBuses(req, res, next) {
        try {
            const buses = await busService.getAll();
            res.status(200).json(buses);
        } catch (err) {
            next(err);
        }
    }

    async getPaginatedBuses(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await busService.getPaginatedBuses(page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async createBus(req, res, next) {
        try {
            const newBus = await busService.createBus(req.body);
            res.status(201).json(newBus);
        } catch (err) {
            next(err);
        }
    }

    async getBus(req, res, next) {
        try {
            const bus = await busService.getById(req.params.id);
            if (!bus) return res.status(404).json({ message: "Bus not found" });
            res.status(200).json(bus);
        } catch (err) {
            next(err);
        }
    }

    async updateBus(req, res, next) {
        try {
            const updatedBus = await busService.updateBus(req.params.id, req.body);
            if (!updatedBus) return res.status(404).json({ message: "Bus not found" });
            res.status(200).json(updatedBus);
        } catch (err) {
            next(err);
        }
    }

    async deleteBus(req, res, next) {
        try {
            await busService.deleteById(req.params.id);
            res.status(200).json({ message: "Bus deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async searchBuses(req, res, next) {
        try {
            const { from: origin, to: destination, departureDate: date } = req.query;
            const buses = await busService.searchBuses(origin, destination, date);
            res.status(200).json(buses);
        } catch (err) {
            next(err);
        }
    }

    async getBusesByOperator(req, res, next) {
        try {
            const { operatorCode } = req.params;
            const buses = await busService.getBusesByOperator(operatorCode);
            res.status(200).json(buses);
        } catch (err) {
            next(err);
        }
    }

    async updateBusStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedBus = await busService.updateBusStatus(id, status);
            if (!updatedBus) return res.status(404).json({ message: "Bus not found" });
            res.status(200).json(updatedBus);
        } catch (err) {
            next(err);
        }
    }
}

export default new BusController();
