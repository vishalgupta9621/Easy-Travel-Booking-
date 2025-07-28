import express from "express";
import { body } from "express-validator";
import {
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  changePassword
} from "../controllers/auth.js";
import { verifyUser } from "../utils/verifytoken.js";

const router = express.Router();

// Registration validation
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number')
];

// Login validation
const loginValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation
const profileUpdateValidation = [
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number')
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", logout);
router.get("/profile", verifyUser, getProfile);
router.put("/profile", verifyUser, profileUpdateValidation, updateProfile);
router.put("/change-password", verifyUser, changePasswordValidation, changePassword);

export default router;