/**
 * Authentication service for handling user registration, login, and profile management
 */

import { httpClient } from './httpClient'
import { queryClient } from './queryClient'
import { queryKeys } from './queryKeys'

// Types based on backend implementation
export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface AuthUser {
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

export interface UserUpdateRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_token'
  private readonly USER_KEY = 'auth_user'

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthUser> {
    try {
      const response = await httpClient.post<ApiResponse<AuthUser>>(
        '/api/auth/register',
        userData
      )

      if (response.data.success) {
        // Store token and user data
        this.setAuthData(response.data.data)
        return response.data.data
      }

      throw new Error(response.data.message || 'Registration failed')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthUser> {
    try {
      const response = await httpClient.post<ApiResponse<AuthUser>>(
        '/api/auth/login',
        credentials
      )

      if (response.data.success) {
        // Store token and user data
        this.setAuthData(response.data.data)
        return response.data.data
      }

      throw new Error(response.data.message || 'Login failed')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if it exists
      await httpClient.post('/api/auth/logout').catch(() => {
        // Ignore errors from logout endpoint
      })
    } finally {
      // Always clear local auth data
      this.clearAuthData()

      // Clear all cached data
      queryClient.clear()
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response =
        await httpClient.get<ApiResponse<User>>('/api/auth/profile')

      if (response.data.success) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Failed to get profile')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile')
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: UserUpdateRequest): Promise<User> {
    try {
      const response = await httpClient.put<ApiResponse<User>>(
        '/api/auth/profile',
        userData
      )

      if (response.data.success) {
        // Update stored user data
        const currentUser = this.getCurrentUser()
        if (currentUser) {
          const updatedUser = { ...currentUser, ...response.data.data }
          localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser))
        }

        // Invalidate profile cache
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })

        return response.data.data
      }

      throw new Error(response.data.message || 'Failed to update profile')
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update profile'
      )
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwords: PasswordChangeRequest): Promise<void> {
    try {
      const response = await httpClient.put<ApiResponse<void>>(
        '/api/auth/password',
        passwords
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to change password')
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to change password'
      )
    }
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  /**
   * Get stored user data
   */
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY)
    if (!userData) return null

    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser()
  }

  /**
   * Store auth data
   */
  private setAuthData(authData: AuthUser): void {
    localStorage.setItem(this.TOKEN_KEY, authData.token)
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user))
  }

  /**
   * Clear auth data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  /**
   * Initialize auth state from storage
   */
  initializeAuth(): User | null {
    const token = this.getToken()
    const user = this.getCurrentUser()

    if (token && user) {
      return user
    }

    // Clear invalid auth data
    this.clearAuthData()
    return null
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
