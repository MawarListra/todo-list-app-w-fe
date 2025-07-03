/**
 * User-related TypeScript type definitions
 * Defines interfaces for user authentication and management
 */

/**
 * User entity interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

/**
 * User data without sensitive information (for API responses)
 */
export interface UserPublic {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

/**
 * User data with password hash (for internal use)
 */
export interface UserWithPassword extends User {
  passwordHash: string;
}

/**
 * User registration request
 */
export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * User login request
 */
export interface UserLoginRequest {
  email: string;
  password: string;
}

/**
 * User login response
 */
export interface UserLoginResponse {
  user: UserPublic;
  token: string;
  expiresIn: number;
}

/**
 * JWT token payload
 */
export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * User update request
 */
export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * User profile response
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  listsCount: number;
  tasksCount: number;
}
