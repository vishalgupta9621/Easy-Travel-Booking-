import BaseRepository from './base/base.repository.js';
import User from '../models/users.model.js';

export class UsersRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    async getPaginatedUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const users = await this.model.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        const total = await this.model.countDocuments();
        
        return {
            users,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }
}

export default new UsersRepository(); 