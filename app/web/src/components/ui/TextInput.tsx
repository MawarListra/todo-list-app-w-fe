import React from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn, focusRing, transitionBase } from '@/utils/cn'

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled'
}

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      size = 'md',
      variant = 'default',
      type = 'text',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const inputId = React.useId()
    const errorId = React.useId()
    const helperTextId = React.useId()

    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const baseClasses = cn(
      'block w-full rounded-md border transition-colors',
      focusRing(),
      transitionBase(),
      inputSizes[size]
    )

    const variantClasses = {
      default: cn(
        'border-gray-300 bg-white',
        error
          ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
          : 'focus:border-primary-500 focus:ring-primary-500',
        disabled && 'bg-gray-50 text-gray-500'
      ),
      filled: cn(
        'border-gray-200 bg-gray-50',
        error
          ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
          : 'focus:border-primary-500 focus:ring-primary-500',
        disabled && 'bg-gray-100 text-gray-500'
      ),
    }

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span
                className={cn(iconSizes[size], 'text-gray-400')}
                aria-hidden="true"
              >
                {icon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(error && errorId, helperText && helperTextId)}
            className={cn(
              baseClasses,
              variantClasses[variant],
              icon && 'pl-10',
              isPassword && 'pr-10',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff
                  className={cn(iconSizes[size], 'text-gray-400')}
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  className={cn(iconSizes[size], 'text-gray-400')}
                  aria-hidden="true"
                />
              )}
            </button>
          )}
        </div>

        {error && (
          <div
            id={errorId}
            className="mt-1 flex items-center text-sm text-error-600"
          >
            <AlertCircle
              className="w-4 h-4 mr-1 flex-shrink-0"
              aria-hidden="true"
            />
            {error}
          </div>
        )}

        {helperText && !error && (
          <p id={helperTextId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'
