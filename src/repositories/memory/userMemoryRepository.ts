/**
 * In-memory implementation of user repository
 */

import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../interfaces/IUserRepository.js';
import {
  User,
  UserWithPassword,
  UserRegistrationRequest,
  UserUpdateRequest
} from '../../types/user.types.js';

/**
 * In-memory user repository implementation
 */
export class UserMemoryRepository implements IUserRepository {
  private users: Map<string, UserWithPassword> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  /**
   * Seed default users for development
   */
  private seedDefaultUsers(): void {
    const defaultUsers: UserWithPassword[] = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        username: 'demo',
        email: 'demo@example.com',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LdZZn.CZJQ4J9MUgW', // "password123"
        firstName: 'Demo',
        lastName: 'User',
        isActive: true,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
        lastLogin: new Date()
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        username: 'john.doe',
        email: 'john.doe@example.com',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LdZZn.CZJQ4J9MUgW', // "password123"
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: new Date('2025-01-15T00:00:00Z'),
        updatedAt: new Date('2025-01-15T00:00:00Z')
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        username: 'jane.smith',
        email: 'jane.smith@example.com',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LdZZn.CZJQ4J9MUgW', // "password123"
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
        createdAt: new Date('2025-02-01T00:00:00Z'),
        updatedAt: new Date('2025-02-01T00:00:00Z')
      }
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  /**
   * Convert UserWithPassword to User (remove password hash)
   */
  private toUser(userWithPassword: UserWithPassword): User {
    const { passwordHash, ...user } = userWithPassword;
    return user;
  }

  /**
   * Create a new user
   */
  async create(userData: UserRegistrationRequest & { passwordHash: string }): Promise<User> {
    const id = uuidv4();
    const now = new Date();

    const newUser: UserWithPassword = {
      id,
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      ...(userData.firstName && { firstName: userData.firstName }),
      ...(userData.lastName && { lastName: userData.lastName })
    };

    this.users.set(id, newUser);
    return this.toUser(newUser);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? this.toUser(user) : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email && user.isActive) {
        return this.toUser(user);
      }
    }
    return null;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username && user.isActive) {
        return this.toUser(user);
      }
    }
    return null;
  }

  /**
   * Find user by email with password hash (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    for (const user of this.users.values()) {
      if (user.email === email && user.isActive) {
        return user;
      }
    }
    return null;
  }

  /**
   * Update user by ID
   */
  async update(id: string, userData: UserUpdateRequest): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    const updatedUser: UserWithPassword = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return this.toUser(updatedUser);
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) {
      return false;
    }

    const updatedUser: UserWithPassword = {
      ...user,
      passwordHash,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return true;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) {
      return false;
    }

    const updatedUser: UserWithPassword = {
      ...user,
      lastLogin: new Date(),
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return true;
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivate(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) {
      return false;
    }

    const updatedUser: UserWithPassword = {
      ...user,
      isActive: false,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return true;
  }

  /**
   * Activate user
   */
  async activate(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) {
      return false;
    }

    const updatedUser: UserWithPassword = {
      ...user,
      isActive: true,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return true;
  }

  /**
   * Delete user permanently
   */
  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  /**
   * Get all users (admin operation)
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<User[]> {
    const allUsers = Array.from(this.users.values())
      .filter(user => user.isActive)
      .slice(offset, offset + limit);

    return allUsers.map(user => this.toUser(user));
  }

  /**
   * Count total users
   */
  async count(): Promise<number> {
    return Array.from(this.users.values()).filter(user => user.isActive).length;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return true;
      }
    }
    return false;
  }
}
