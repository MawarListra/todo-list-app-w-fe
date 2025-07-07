import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, User } from '../services/authService'

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const authData = await authService.login({ email, password })
          set({
            user: authData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })

        try {
          const authData = await authService.register(data)
          set({
            user: authData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error:
              error instanceof Error ? error.message : 'Registration failed',
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          await authService.logout()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // Always clear state even if logout API fails
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      initializeAuth: () => {
        const user = authService.initializeAuth()
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        })
      },
    }),
    {
      name: 'auth-store',
      // Only persist user and isAuthenticated, not loading/error states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selector hooks for better performance
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore()
  return { user, isAuthenticated, isLoading, error }
}

export const useAuthActions = () => {
  const { login, register, logout, clearError, setUser, initializeAuth } =
    useAuthStore()
  return { login, register, logout, clearError, setUser, initializeAuth }
}
