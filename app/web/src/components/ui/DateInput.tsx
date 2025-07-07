import React from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { cn, focusRing, transitionBase } from '@/utils/cn'

export interface DateInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'onChange'
  > {
  label?: string
  value?: Date | null
  onChange: (date: Date | null) => void
  error?: string
  helperText?: string
  showTime?: boolean
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled'
  clearable?: boolean
  disabled?: boolean
  format?: string
}

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const formatDate = (
  date: Date | null,
  showTime: boolean = false,
  format?: string
): string => {
  if (!date) return ''

  if (format) {
    // Simple format implementation - can be enhanced with a proper date formatting library
    return format
      .replace('YYYY', date.getFullYear().toString())
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', date.getDate().toString().padStart(2, '0'))
      .replace('HH', date.getHours().toString().padStart(2, '0'))
      .replace('mm', date.getMinutes().toString().padStart(2, '0'))
  }

  const dateStr = date.toLocaleDateString()
  const timeStr = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return showTime ? `${dateStr} ${timeStr}` : dateStr
}

const parseDate = (value: string): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      helperText,
      showTime = false,
      minDate,
      maxDate,
      placeholder,
      size = 'md',
      variant = 'default',
      clearable = true,
      disabled = false,
      format,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')
    const [tempDate, setTempDate] = React.useState<Date | null>(value)

    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const inputId = React.useId()
    const errorId = React.useId()
    const helperTextId = React.useId()

    // Update input value when value prop changes
    React.useEffect(() => {
      setInputValue(formatDate(value, showTime, format))
      setTempDate(value)
    }, [value, showTime, format])

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)

      // Try to parse the input value
      const parsedDate = parseDate(newValue)
      if (parsedDate) {
        setTempDate(parsedDate)
      }
    }

    // Handle input blur
    const handleInputBlur = () => {
      const parsedDate = parseDate(inputValue)
      if (parsedDate) {
        onChange(parsedDate)
      } else if (inputValue === '') {
        onChange(null)
      } else {
        // Reset to previous valid value
        setInputValue(formatDate(value, showTime, format))
      }
    }

    // Handle calendar date selection
    const handleDateSelect = (date: Date) => {
      if (showTime && tempDate) {
        // Preserve time when selecting date
        const newDate = new Date(date)
        newDate.setHours(tempDate.getHours(), tempDate.getMinutes())
        onChange(newDate)
      } else {
        onChange(date)
      }
      if (!showTime) {
        setIsOpen(false)
      }
    }

    // Handle time change
    const handleTimeChange = (time: string) => {
      if (!tempDate) return

      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(tempDate)
      newDate.setHours(hours, minutes)
      setTempDate(newDate)
      onChange(newDate)
    }

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(null)
      setIsOpen(false)
    }

    // Handle click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Generate calendar days
    const generateCalendar = () => {
      const today = new Date()
      const currentDate = tempDate || today
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        days.push(date)
      }

      return days
    }

    const calendarDays = generateCalendar()
    const currentDate = tempDate || new Date()

    return (
      <div className={cn('relative', className)} ref={containerRef}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref || inputRef}
            id={inputId}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={() => setIsOpen(true)}
            placeholder={
              placeholder || (showTime ? 'Select date and time' : 'Select date')
            }
            disabled={disabled}
            className={cn(
              'w-full pr-10 border border-gray-300 rounded-md bg-white',
              inputSizes[size],
              focusRing,
              transitionBase,
              error && 'border-red-500',
              disabled && 'opacity-50 cursor-not-allowed',
              variant === 'filled' && 'bg-gray-50',
              !disabled && 'hover:border-gray-400'
            )}
            aria-describedby={cn(error && errorId, helperText && helperTextId)}
            {...props}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-100 rounded"
                disabled={disabled}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <Calendar className="w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="p-4">
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const newDate = new Date(currentDate)
                    newDate.setMonth(newDate.getMonth() - 1)
                    setTempDate(newDate)
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ←
                </button>
                <h3 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const newDate = new Date(currentDate)
                    newDate.setMonth(newDate.getMonth() + 1)
                    setTempDate(newDate)
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  →
                </button>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth =
                    day.getMonth() === currentDate.getMonth()
                  const isToday =
                    day.toDateString() === new Date().toDateString()
                  const isSelected =
                    value && day.toDateString() === value.toDateString()
                  const isDisabled =
                    (minDate && day < minDate) || (maxDate && day > maxDate)

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(day)}
                      disabled={isDisabled}
                      className={cn(
                        'w-8 h-8 text-sm rounded-md flex items-center justify-center',
                        'hover:bg-gray-100 transition-colors',
                        !isCurrentMonth && 'text-gray-400',
                        isToday && 'bg-blue-50 text-blue-600',
                        isSelected &&
                          'bg-primary-600 text-white hover:bg-primary-700',
                        isDisabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>

              {/* Time picker */}
              {showTime && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      value={
                        tempDate
                          ? `${tempDate.getHours().toString().padStart(2, '0')}:${tempDate.getMinutes().toString().padStart(2, '0')}`
                          : '12:00'
                      }
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperTextId} className="mt-1 text-sm text-gray-600">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

DateInput.displayName = 'DateInput'
