import express from 'express';
import { UsersController } from '../app/api/v1/controllers/users.controller.js';

const router = express.Router();
const usersController = new UsersController();

// Auth routes
router.post('/login', usersController.login);
router.post('/register', usersController.createUser);

// Password reset routes
router.post('/forgot-password', usersController.forgotPassword);
router.post('/reset-password', usersController.resetPassword);
router.get('/validate-reset-token', usersController.validateResetToken);

// Profile routes (these would need auth middleware in production)
router.get('/profile', usersController.getUser);
router.put('/profile', usersController.updateUser);

export default router;
