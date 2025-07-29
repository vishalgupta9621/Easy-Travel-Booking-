import express from 'express';
import { UsersController } from '../app/api/v1/controllers/users.controller.js';
const router = express.Router();
const usersController = new UsersController();

// Public routes
router.post('/login', usersController.login);
router.post('/users', usersController.createUser);

// Protected routes
// router.use(authMiddleware);
router.get('/', usersController.getUsers);
router.get('/paginated', usersController.getPaginatedUsers);
router.get('/:id', usersController.getUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

export default router; 