import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";


// Register user
export const register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const { username, email, password, firstName, lastName, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return next(createError(400, "User with this email or username already exists!"));
    }

    // Hash password
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'user' // Default to 'user' role
    });

    await newUser.save();

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = newUser._doc;

    res.status(201).json({
      message: "User registered successfully!",
      user: userWithoutPassword
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      next(createError(400, `${field} already exists!`));
    } else {
      next(err);
    }
  }
};


// Login user
export const login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const { username, email, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(createError(403, "Account is deactivated. Please contact support."));
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(400, "Invalid credentials!"));
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
        email: user.email
      },
      process.env.JWT,
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      .status(200)
      .json({
        message: "Login successful!",
        user: userWithoutPassword,
        token
      });
  } catch (err) {
    next(err);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "Logout successful!" });
  } catch (err) {
    next(err);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return next(createError(404, "User not found!"));
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'dateOfBirth', 'gender', 'preferences'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(createError(404, "User not found!"));
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      user
    });
  } catch (err) {
    next(err);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array()[0].msg));
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    // Verify current password
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return next(createError(400, "Current password is incorrect!"));
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(12);
    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (err) {
    next(err);
  }
};
