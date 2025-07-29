import express from 'express';
import { UsersController } from '../app/api/v1/controllers/users.controller.js';

const router = express.Router();
const usersController = new UsersController();

// Auth routes
router.post('/login', usersController.login);
router.post('/register', usersController.createUser);

// Profile routes (these would need auth middleware in production)
router.get('/profile', usersController.getUser);
router.put('/profile', usersController.updateUser);

export default router;
