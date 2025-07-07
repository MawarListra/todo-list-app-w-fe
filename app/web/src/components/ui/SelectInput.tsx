import React from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn, focusRing, transitionBase } from '@/utils/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectInputProps {
  label?: string
  placeholder?: string
  value?: string | string[]
  options: SelectOption[]
  error?: string
  helperText?: string
  disabled?: boolean
  multiple?: boolean
  searchable?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  onChange: (value: string | string[]) => void
  onSearch?: (query: string) => void
  className?: string
}

const selectSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

export const SelectInput = React.forwardRef<HTMLDivElement, SelectInputProps>(
  (
    {
      label,
      placeholder = 'Select an option',
      value,
      options,
      error,
      helperText,
      disabled,
      multiple = false,
      searchable = false,
      loading = false,
      size = 'md',
      onChange,
      onSearch,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [focusedIndex, setFocusedIndex] = React.useState(-1)

    const selectRef = React.useRef<HTMLDivElement>(null)
    const searchRef = React.useRef<HTMLInputElement>(null)
    const optionsRef = React.useRef<HTMLDivElement>(null)

    const selectId = React.useId()
    const errorId = React.useId()
    const helperTextId = React.useId()

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }, [options, searchQuery])

    // Get selected options
    const selectedOptions = React.useMemo(() => {
      if (!value) return []
      const values = Array.isArray(value) ? value : [value]
      return options.filter((option) => values.includes(option.value))
    }, [options, value])

    // Handle option selection
    const handleOptionSelect = (option: SelectOption) => {
      if (option.disabled) return

      if (multiple) {
        const currentValues = Array.isArray(value) ? value : []
        const newValues = currentValues.includes(option.value)
          ? currentValues.filter((v) => v !== option.value)
          : [...currentValues, option.value]
        onChange(newValues)
      } else {
        onChange(option.value)
        setIsOpen(false)
      }
    }

    // Handle search
    const handleSearch = (query: string) => {
      setSearchQuery(query)
      setFocusedIndex(-1)
      onSearch?.(query)
    }

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return

      switch (event.key) {
        case 'Enter':
          event.preventDefault()
          if (isOpen && focusedIndex >= 0) {
            handleOptionSelect(filteredOptions[focusedIndex])
          } else {
            setIsOpen(!isOpen)
          }
          break
        case 'Escape':
          setIsOpen(false)
          break
        case 'ArrowDown':
          event.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
          } else {
            setFocusedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : prev
            )
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          if (isOpen) {
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          }
          break
        case 'Tab':
          setIsOpen(false)
          break
      }
    }

    // Handle click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search input when opened
    React.useEffect(() => {
      if (isOpen && searchable && searchRef.current) {
        searchRef.current.focus()
      }
    }, [isOpen, searchable])

    // Display value
    const displayValue = React.useMemo(() => {
      if (selectedOptions.length === 0) return placeholder
      if (multiple) {
        return selectedOptions.length === 1
          ? selectedOptions[0].label
          : `${selectedOptions.length} selected`
      }
      return selectedOptions[0]?.label || placeholder
    }, [selectedOptions, placeholder, multiple])

    return (
      <div className={cn('relative', className)} ref={ref}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}

        <div
          ref={selectRef}
          className={cn(
            'relative',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <button
            id={selectId}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full flex items-center justify-between',
              'border border-gray-300 rounded-md bg-white',
              selectSizes[size],
              focusRing,
              transitionBase,
              error && 'border-red-500',
              disabled && 'cursor-not-allowed',
              !disabled && 'hover:border-gray-400',
              isOpen && 'border-primary-500 ring-1 ring-primary-500'
            )}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-describedby={cn(error && errorId, helperText && helperTextId)}
          >
            <span
              className={cn(
                'truncate',
                !selectedOptions.length && 'text-gray-500'
              )}
            >
              {displayValue}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <div
              ref={optionsRef}
              className={cn(
                'absolute z-50 w-full mt-1',
                'bg-white border border-gray-300 rounded-md shadow-lg',
                'max-h-60 overflow-auto'
              )}
              role="listbox"
              aria-multiselectable={multiple}
            >
              {searchable && (
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className={cn(
                        'w-full pl-10 pr-3 py-2 text-sm',
                        'border border-gray-300 rounded-md',
                        focusRing
                      )}
                    />
                  </div>
                </div>
              )}

              {loading ? (
                <div className="p-3 text-center text-gray-500">Loading...</div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  {searchQuery ? 'No results found' : 'No options available'}
                </div>
              ) : (
                <div className="py-1">
                  {filteredOptions.map((option, index) => {
                    const isSelected = Array.isArray(value)
                      ? value.includes(option.value)
                      : value === option.value
                    const isFocused = index === focusedIndex

                    return (
                      <div
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          'flex items-center px-3 py-2 cursor-pointer text-sm',
                          'hover:bg-gray-50',
                          isFocused && 'bg-gray-100',
                          isSelected && 'bg-primary-50 text-primary-700',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => handleOptionSelect(option)}
                        onMouseEnter={() => setFocusedIndex(index)}
                      >
                        {multiple && (
                          <div
                            className={cn(
                              'w-4 h-4 mr-2 rounded border flex items-center justify-center',
                              isSelected
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-gray-300'
                            )}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                        <span className="flex-1 truncate">{option.label}</span>
                        {!multiple && isSelected && (
                          <Check className="w-4 h-4 text-primary-600" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {multiple && selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-md"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOptionSelect(option)
                  }}
                  className="ml-1 p-0.5 hover:bg-primary-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
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

SelectInput.displayName = 'SelectInput'
