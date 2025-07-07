import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoginForm } from '../components/features/auth/LoginForm'
import { RegisterForm } from '../components/features/auth/RegisterForm'
import { useAuthState } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'

type AuthMode = 'login' | 'register'

export const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthState()
  const { initializeAuth } = useAuthStore()

  // Get initial mode from URL or default to login
  const getInitialMode = (): AuthMode => {
    const path = location.pathname
    if (path.includes('/register')) return 'register'
    return 'login'
  }

  const [mode, setMode] = useState<AuthMode>(getInitialMode())

  // Initialize auth state on component mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = (location.state as any)?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, location.state])

  // Update URL when mode changes
  useEffect(() => {
    const newPath = mode === 'register' ? '/register' : '/login'
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true })
    }
  }, [mode, navigate, location.pathname])

  const handleAuthSuccess = () => {
    const redirectTo = (location.state as any)?.from?.pathname || '/'
    navigate(redirectTo, { replace: true })
  }

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Todo List App
          </h1>
          <p className="text-gray-600">
            Organize your tasks and boost productivity
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onRegisterClick={() => handleModeChange('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onLoginClick={() => handleModeChange('login')}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>&copy; 2025 Todo List App. All rights reserved.</p>
      </div>
    </div>
  )
}

export default AuthPage
