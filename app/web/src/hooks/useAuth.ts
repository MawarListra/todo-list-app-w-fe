import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../services/queryKeys'
import {
  authService,
  User,
  LoginRequest,
  RegisterRequest,
  UserUpdateRequest,
  PasswordChangeRequest,
} from '../services/authService'
import { useAuthStore } from '../stores/authStore'

/**
 * Hook for user profile data
 */
export const useProfile = () => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for login mutation
 */
export const useLogin = () => {
  const { login } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: LoginRequest) => login(email, password),
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })
    },
    onError: (error) => {
      console.error('Login error:', error)
    },
  })
}

/**
 * Hook for registration mutation
 */
export const useRegister = () => {
  const { register } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })
    },
    onError: (error) => {
      console.error('Registration error:', error)
    },
  })
}

/**
 * Hook for logout mutation
 */
export const useLogout = () => {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Logout error:', error)
      // Still clear cache even if logout fails
      queryClient.clear()
    },
  })
}

/**
 * Hook for updating user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: UserUpdateRequest) => authService.updateProfile(data),
    onSuccess: (updatedUser: User) => {
      // Update auth store
      setUser(updatedUser)

      // Update cached profile data
      queryClient.setQueryData(queryKeys.auth.profile(), updatedUser)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })
    },
    onError: (error) => {
      console.error('Profile update error:', error)
    },
  })
}

/**
 * Hook for changing password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: PasswordChangeRequest) =>
      authService.changePassword(data),
    onError: (error) => {
      console.error('Password change error:', error)
    },
  })
}

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated
}

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  const { user } = useAuthStore()
  return user
}

/**
 * Hook for authentication loading state
 */
export const useAuthLoading = () => {
  const { isLoading } = useAuthStore()
  return isLoading
}

/**
 * Hook for authentication error
 */
export const useAuthError = () => {
  const { error, clearError } = useAuthStore()
  return { error, clearError }
}

/**
 * Combined hook for auth state
 */
export const useAuthState = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore()
  const { clearError } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    clearError,
  }
}

/**
 * Main authentication hook - provides access to auth state
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  }
}
