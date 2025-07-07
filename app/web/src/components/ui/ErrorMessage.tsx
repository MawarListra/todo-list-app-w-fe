import React from 'react'
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ErrorMessageProps {
  children: React.ReactNode
  variant?: 'error' | 'warning' | 'info' | 'success'
  size?: 'sm' | 'md' | 'lg'
  inline?: boolean
  showIcon?: boolean
  className?: string
}

const variantStyles = {
  error: {
    container: 'text-red-700 bg-red-50 border-red-200',
    icon: 'text-red-500',
    IconComponent: AlertCircle,
  },
  warning: {
    container: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-500',
    IconComponent: AlertTriangle,
  },
  info: {
    container: 'text-blue-700 bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    IconComponent: Info,
  },
  success: {
    container: 'text-green-700 bg-green-50 border-green-200',
    icon: 'text-green-500',
    IconComponent: CheckCircle,
  },
}

const sizeStyles = {
  sm: {
    container: 'text-xs px-2 py-1',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'text-sm px-3 py-2',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'text-base px-4 py-3',
    icon: 'w-5 h-5',
  },
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  variant = 'error',
  size = 'md',
  inline = false,
  showIcon = true,
  className,
}) => {
  const variantStyle = variantStyles[variant]
  const sizeStyle = sizeStyles[size]
  const IconComponent = variantStyle.IconComponent

  if (inline) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1',
          variantStyle.container
            .split(' ')
            .filter((c) => c.startsWith('text-'))
            .join(' '),
          sizeStyle.container
            .split(' ')
            .filter((c) => c.startsWith('text-'))
            .join(' '),
          className
        )}
        role="alert"
      >
        {showIcon && (
          <IconComponent
            className={cn(sizeStyle.icon, variantStyle.icon)}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2 border rounded-md',
        variantStyle.container,
        sizeStyle.container,
        className
      )}
      role="alert"
    >
      {showIcon && (
        <IconComponent
          className={cn(
            'flex-shrink-0 mt-0.5',
            sizeStyle.icon,
            variantStyle.icon
          )}
          aria-hidden="true"
        />
      )}
      <div className="flex-1">{children}</div>
    </div>
  )
}

// Convenience components for specific variants
export const ErrorText: React.FC<Omit<ErrorMessageProps, 'variant'>> = (
  props
) => <ErrorMessage {...props} variant="error" />

export const WarningText: React.FC<Omit<ErrorMessageProps, 'variant'>> = (
  props
) => <ErrorMessage {...props} variant="warning" />

export const InfoText: React.FC<Omit<ErrorMessageProps, 'variant'>> = (
  props
) => <ErrorMessage {...props} variant="info" />

export const SuccessText: React.FC<Omit<ErrorMessageProps, 'variant'>> = (
  props
) => <ErrorMessage {...props} variant="success" />

// Field error message component specifically for form fields
export interface FieldErrorProps {
  error?: string | string[]
  className?: string
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className }) => {
  if (!error) return null

  const errors = Array.isArray(error) ? error : [error]

  return (
    <div className={cn('mt-1 space-y-1', className)}>
      {errors.map((err, index) => (
        <ErrorMessage
          key={index}
          variant="error"
          size="sm"
          inline
          showIcon={false}
        >
          {err}
        </ErrorMessage>
      ))}
    </div>
  )
}
