/**
 * User repository interface for data access abstraction
 */

import {
  User,
  UserWithPassword,
  UserRegistrationRequest,
  UserUpdateRequest
} from '../../types/user.types.js';

/**
 * Interface for user data access operations
 */
export interface IUserRepository {
  /**
   * Create a new user
   */
  create(userData: UserRegistrationRequest & { passwordHash: string }): Promise<User>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by username
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find user by email with password hash (for authentication)
   */
  findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;

  /**
   * Update user by ID
   */
  update(id: string, userData: UserUpdateRequest): Promise<User | null>;

  /**
   * Update user password
   */
  updatePassword(id: string, passwordHash: string): Promise<boolean>;

  /**
   * Update last login timestamp
   */
  updateLastLogin(id: string): Promise<boolean>;

  /**
   * Deactivate user (soft delete)
   */
  deactivate(id: string): Promise<boolean>;

  /**
   * Activate user
   */
  activate(id: string): Promise<boolean>;

  /**
   * Delete user permanently
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get all users (admin operation)
   */
  findAll(limit?: number, offset?: number): Promise<User[]>;

  /**
   * Count total users
   */
  count(): Promise<number>;

  /**
   * Check if email exists
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Check if username exists
   */
  usernameExists(username: string): Promise<boolean>;
}
