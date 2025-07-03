/**
 * Authentication controller for handling user registration, login, and profile management
 */

import { Request, Response } from 'express';
import { UserService } from '../services/userService.js';
import {
  UserRegistrationRequest,
  UserLoginRequest,
  UserUpdateRequest,
  PasswordChangeRequest
} from '../types/user.types.js';

/**
 * Authentication controller class
 */
export class AuthController {
  constructor(private userService: UserService) {}

  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: UserRegistrationRequest = req.body;
      const result = await this.userService.register(userData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
        error: error instanceof Error ? error.name : 'Unknown error'
      });
    }
  };

  /**
   * Login user
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: UserLoginRequest = req.body;
      const result = await this.userService.login(credentials);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        error: error instanceof Error ? error.name : 'Unknown error'
      });
    }
  };

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      const profile = await this.userService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Profile not found',
        error: error instanceof Error ? error.name : 'Unknown error'
      });
    }
  };

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      const updateData: UserUpdateRequest = req.body;
      const updatedUser = await this.userService.updateProfile(req.user.userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.name === 'ConflictError' ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Profile update failed',
        error: error instanceof Error ? error.name : 'Unknown error'
      });
    }
  };

  /**
   * Change user password
   * POST /api/auth/change-password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      const passwordData: PasswordChangeRequest = req.body;
      await this.userService.changePassword(req.user.userId, passwordData);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Password change failed',
        error: error instanceof Error ? error.name : 'Unknown error'
      });
    }
  };

  /**
   * Deactivate user account
   * DELETE /api/auth/account
   */
  deactivateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      await this.userService.deactivateAccount(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Account deactivation failed',
        error: error instanceof Error ? error.name : 'Unknown error'
      });
    }
  };

  /**
   * Logout user (client-side token removal)
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // This endpoint exists for consistency and to potentially blacklist tokens in the future
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please remove the token from your client.'
    });
  };

  /**
   * Refresh token (get new token with extended expiration)
   * POST /api/auth/refresh
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }

      // Get fresh user data
      const user = await this.userService.getUserById(req.user.userId);

      // Generate new token
      const { generateToken, getTokenExpirationTime } = await import('../services/authService.js');
      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token,
          expiresIn: getTokenExpirationTime(),
          user
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
        error: error instanceof Error ? error.name : 'Unknown error'
      });
    }
  };
}
