import React from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn, transitionBase } from '@/utils/cn'

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

const toastVariants = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-500',
    IconComponent: CheckCircle,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-500',
    IconComponent: AlertCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-500',
    IconComponent: AlertTriangle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-500',
    IconComponent: Info,
  },
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'info',
  duration = 5000,
  onClose,
  action,
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isExiting, setIsExiting] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const toastVariant = toastVariants[variant]
  const IconComponent = toastVariant.IconComponent

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose()
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 200)
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose()
      }, duration)
    }
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md overflow-hidden rounded-lg border shadow-lg',
        toastVariant.container,
        transitionBase,
        'transform transition-all duration-300 ease-in-out',
        isVisible && !isExiting && 'translate-x-0 opacity-100',
        !isVisible && 'translate-x-full opacity-0',
        isExiting && 'translate-x-full opacity-0'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
    >
      <div className="flex w-0 flex-1 items-start p-4">
        <div className="flex-shrink-0">
          <IconComponent
            className={cn('h-5 w-5', toastVariant.icon)}
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 w-0 flex-1">
          {title && <p className="text-sm font-medium">{title}</p>}
          {description && (
            <p className={cn('text-sm', title && 'mt-1')}>{description}</p>
          )}
        </div>
      </div>

      <div className="flex border-l border-gray-200">
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              'flex items-center justify-center w-full border border-transparent',
              'p-4 text-sm font-medium hover:bg-gray-50 focus:outline-none',
              'focus:ring-2 focus:ring-gray-500'
            )}
          >
            {action.label}
          </button>
        )}

        <button
          onClick={handleClose}
          className={cn(
            'flex items-center justify-center w-full border border-transparent',
            'p-4 text-sm font-medium hover:bg-gray-50 focus:outline-none',
            'focus:ring-2 focus:ring-gray-500'
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export interface ToastContainerProps {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center'
  children: React.ReactNode
}

const positionStyles = {
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  children,
}) => {
  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col space-y-4 p-4 pointer-events-none',
        positionStyles[position]
      )}
    >
      {children}
    </div>
  )
}
