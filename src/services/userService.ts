/**
 * User service for handling authentication and user management business logic
 */

import { IUserRepository } from '../repositories/interfaces/IUserRepository.js';
import {
  User,
  UserPublic,
  UserRegistrationRequest,
  UserLoginRequest,
  UserLoginResponse,
  UserUpdateRequest,
  PasswordChangeRequest,
  UserProfile
} from '../types/user.types.js';
import {
  generateToken,
  hashPassword,
  verifyPassword,
  getTokenExpirationTime,
  validatePasswordStrength
} from './authService.js';
import { ValidationError, NotFoundError, ConflictError } from '../exceptions/customExceptions.js';

/**
 * User service class
 */
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Register a new user
   */
  async register(userData: UserRegistrationRequest): Promise<UserLoginResponse> {
    // Validate input
    this.validateRegistrationInput(userData);

    // Validate password strength
    const passwordValidation = validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new ValidationError(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(userData.email);
    if (emailExists) {
      throw new ConflictError('Email address is already registered');
    }

    // Check if username already exists
    const usernameExists = await this.userRepository.usernameExists(userData.username);
    if (usernameExists) {
      throw new ConflictError('Username is already taken');
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      passwordHash
    });

    // Generate token
    const token = generateToken(user);

    return {
      user,
      token,
      expiresIn: getTokenExpirationTime()
    };
  }

  /**
   * Login user
   */
  async login(credentials: UserLoginRequest): Promise<UserLoginResponse> {
    // Validate input
    this.validateLoginInput(credentials);

    // Find user by email with password
    const userWithPassword = await this.userRepository.findByEmailWithPassword(credentials.email);
    if (!userWithPassword) {
      throw new ValidationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      credentials.password,
      userWithPassword.passwordHash
    );
    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password');
    }

    // Update last login
    await this.userRepository.updateLastLogin(userWithPassword.id);

    // Convert to public user object
    const { passwordHash, ...user } = userWithPassword;
    const publicUser = { ...user, lastLogin: new Date() };

    // Generate token
    const token = generateToken(publicUser);

    return {
      user: publicUser,
      token,
      expiresIn: getTokenExpirationTime()
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // TODO: Get actual counts from list and task repositories
    // For now, return mock data
    return {
      ...user,
      listsCount: 0,
      tasksCount: 0
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: UserUpdateRequest): Promise<User> {
    // Validate input
    this.validateUpdateInput(updateData);

    // Check if email is being changed and already exists
    if (updateData.email) {
      const existingUser = await this.userRepository.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Email address is already in use');
      }
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, passwordData: PasswordChangeRequest): Promise<boolean> {
    // Validate input
    this.validatePasswordChangeInput(passwordData);

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Get user with current password
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userWithPassword = await this.userRepository.findByEmailWithPassword(user.email);
    if (!userWithPassword) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      passwordData.currentPassword,
      userWithPassword.passwordHash
    );
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(passwordData.newPassword);

    // Update password
    return await this.userRepository.updatePassword(userId, newPasswordHash);
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return await this.userRepository.deactivate(userId);
  }

  /**
   * Get user by ID (for internal use)
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * Validate registration input
   */
  private validateRegistrationInput(userData: UserRegistrationRequest): void {
    const errors: string[] = [];

    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email address is required');
    }

    if (!userData.password || userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (userData.firstName && userData.firstName.trim().length === 0) {
      errors.push('First name cannot be empty if provided');
    }

    if (userData.lastName && userData.lastName.trim().length === 0) {
      errors.push('Last name cannot be empty if provided');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Registration validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate login input
   */
  private validateLoginInput(credentials: UserLoginRequest): void {
    const errors: string[] = [];

    if (!credentials.email || !this.isValidEmail(credentials.email)) {
      errors.push('Valid email address is required');
    }

    if (!credentials.password) {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Login validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate update input
   */
  private validateUpdateInput(updateData: UserUpdateRequest): void {
    const errors: string[] = [];

    if (updateData.email && !this.isValidEmail(updateData.email)) {
      errors.push('Valid email address is required');
    }

    if (updateData.firstName !== undefined && updateData.firstName.trim().length === 0) {
      errors.push('First name cannot be empty');
    }

    if (updateData.lastName !== undefined && updateData.lastName.trim().length === 0) {
      errors.push('Last name cannot be empty');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Update validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate password change input
   */
  private validatePasswordChangeInput(passwordData: PasswordChangeRequest): void {
    const errors: string[] = [];

    if (!passwordData.currentPassword) {
      errors.push('Current password is required');
    }

    if (!passwordData.newPassword) {
      errors.push('New password is required');
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push('New password must be different from current password');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Password change validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }
}
