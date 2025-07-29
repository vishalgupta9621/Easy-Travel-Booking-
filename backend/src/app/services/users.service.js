import BaseService from './base/base.service.js';
import usersRepository from '../repositories/users.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UsersService extends BaseService {
    constructor() {
        super(usersRepository);
    }

    async createUser(userData) {
        const existingUser = await usersRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);

        return await this.create(userData);
    }

    async updateUser(id, userData) {
        const user = await this.getById(id);
        if (!user) {
            throw new Error('User not found');
        }

        // If password is being updated, hash it
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        return await this.updateById(id, userData);
    }

    async login(email, password) {
        const user = await usersRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return { token, user };
    }

    async getPaginatedUsers(page, limit) {
        if (page < 1) throw new Error('Page number must be greater than 0');
        if (limit < 1) throw new Error('Limit must be greater than 0');
        
        return await usersRepository.getPaginatedUsers(page, limit);
    }
}

export default new UsersService(); 