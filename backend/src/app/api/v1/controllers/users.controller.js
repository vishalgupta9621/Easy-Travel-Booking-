import usersService from '../../../services/users.service.js';

export class UsersController {
    async getUsers(req, res, next) {
        try {
            const users = await usersService.getAll();
            res.status(200).json(users);
        } catch (err) {
            next(err);
        }
    }

    async getPaginatedUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await usersService.getPaginatedUsers(page, limit);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async createUser(req, res, next) {
        try {
            const newUser = await usersService.createUser(req.body);
            res.status(201).json(newUser);
        } catch (err) {
            next(err);
        }
    }

    async getUser(req, res, next) {
        try {
            const user = await usersService.getById(req.params.id);
            if (!user) return res.status(404).json({ message: "User not found" });
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }

    async updateUser(req, res, next) {
        try {
            const updatedUser = await usersService.updateUser(req.params.id, req.body);
            if (!updatedUser) return res.status(404).json({ message: "User not found" });
            res.status(200).json(updatedUser);
        } catch (err) {
            next(err);
        }
    }

    async deleteUser(req, res, next) {
        try {
            await usersService.deleteById(req.params.id);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (err) {
            next(err);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await usersService.login(email, password);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
}

export default new UsersController(); 