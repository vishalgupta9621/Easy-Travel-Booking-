import BaseService from './base/base.service.js';
import usersRepository from '../repositories/users.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import emailService from '../../services/email.service.js';

export class UsersService extends BaseService {
    constructor() {
        super(usersRepository);
    }

    async createUser(userData) {
        // Check for existing email
        const existingUser = await usersRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already exists');
        }

        // Check for existing username
        const existingUsername = await usersRepository.findByUsername(userData.username);
        if (existingUsername) {
            throw new Error('Username already exists');
        }

        // Check for existing phone number (if provided)
        if (userData.phone) {
            const existingPhone = await usersRepository.findByPhone(userData.phone);
            if (existingPhone) {
                throw new Error('Phone number already exists');
            }
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

    async forgotPassword(email) {
        const user = await usersRepository.findByEmail(email);
        if (!user) {
            throw new Error('No account found with that email address');
        }

        // Generate reset token
        const resetToken = emailService.generateResetToken();
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token to user
        await usersRepository.updateById(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires
        });

        try {
            // Send reset email
            await emailService.sendPasswordResetEmail(
                email,
                resetToken,
                user.firstName || user.username
            );

            return {
                success: true,
                message: 'Password reset email sent successfully'
            };
        } catch (emailError) {
            console.error('Email sending failed:', emailError);

            // Return token for fallback (frontend can handle this)
            return {
                success: true,
                message: 'Password reset initiated. Please check your email.',
                fallback: true,
                resetToken: resetToken // Only for development/fallback
            };
        }
    }

    async resetPassword(token, email, newPassword) {
        const user = await usersRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid reset request');
        }

        // Check if token matches and hasn't expired
        if (user.resetPasswordToken !== token) {
            throw new Error('Invalid or expired reset token');
        }

        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new Error('Reset token has expired');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset fields
        await usersRepository.updateById(user._id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        try {
            // Send confirmation email
            await emailService.sendPasswordChangeConfirmation(
                email,
                user.firstName || user.username
            );
        } catch (emailError) {
            console.error('Confirmation email failed:', emailError);
            // Don't fail the password reset if email fails
        }

        return {
            success: true,
            message: 'Password has been reset successfully'
        };
    }

    async validateResetToken(token, email) {
        const user = await usersRepository.findByEmail(email);
        if (!user) {
            return { valid: false, message: 'Invalid reset request' };
        }

        if (user.resetPasswordToken !== token) {
            return { valid: false, message: 'Invalid reset token' };
        }

        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            return { valid: false, message: 'Reset token has expired' };
        }

        return {
            valid: true,
            message: 'Token is valid',
            user: {
                email: user.email,
                username: user.username,
                firstName: user.firstName
            }
        };
    }
}

export default new UsersService(); 