import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Extend axios types to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date
    }
  }
}

// Default configuration for the HTTP client
const defaultConfig: AxiosRequestConfig = {
  baseURL: 'http://localhost:3001/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
}

// Create the main HTTP client instance
export const httpClient: AxiosInstance = axios.create(defaultConfig)

// Request interceptor for adding auth tokens, logging, etc.
httpClient.interceptors.request.use(
  (config) => {
    // Add timestamp to help with debugging
    config.metadata = { startTime: new Date() }

    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        }
      )
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for logging, error handling, etc.
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = response.config.metadata?.startTime
      ? new Date().getTime() - response.config.metadata.startTime.getTime()
      : 0

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          duration: `${duration}ms`,
          data: response.data,
        }
      )
    }

    return response
  },
  (error) => {
    // Calculate request duration for errors
    const duration = error.config?.metadata?.startTime
      ? new Date().getTime() - error.config.metadata.startTime.getTime()
      : 0

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response?.status,
          duration: `${duration}ms`,
          message: error.message,
          data: error.response?.data,
        }
      )
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle authentication errors
      localStorage.removeItem('authToken')
      // You can add redirect to login page here
      window.location.href = '/login'
    }

    if (error.response?.status === 403) {
      // Handle authorization errors
      console.error('Access denied:', error.response.data?.message)
    }

    if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data?.message)
    }

    return Promise.reject(error)
  }
)

// Generic request wrapper with better error handling
export const apiRequest = async <T>(
  requestConfig: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await httpClient.request<T>(requestConfig)
    return response.data
  } catch (error: any) {
    // Enhanced error information
    const apiError = {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        params: error.config?.params,
      },
    }

    throw apiError
  }
}

// Utility functions for common HTTP methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
}

// Types for better TypeScript support
export interface ApiError {
  message: string
  status?: number
  statusText?: string
  data?: any
  config?: {
    method?: string
    url?: string
    params?: any
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
