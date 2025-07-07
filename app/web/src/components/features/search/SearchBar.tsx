import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, Command } from 'lucide-react'
import { useSearchHistory } from '../../../hooks/useLocalStorage'
import { useFilterStore } from '../../../stores/filterStore'

export interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  suggestions?: string[]
  className?: string
  showShortcuts?: boolean
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search tasks and lists...',
  value: controlledValue,
  onChange,
  suggestions = [],
  className = '',
  showShortcuts = true,
}) => {
  const [internalValue, setInternalValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const { searchHistory, addToSearchHistory, removeFromSearchHistory } =
    useSearchHistory()
  const { searchQuery, setSearchQuery } = useFilterStore()

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue
  const setValue =
    controlledValue !== undefined ? onChange || (() => {}) : setInternalValue

  // Combine suggestions with search history
  const allSuggestions = [
    ...suggestions,
    ...searchHistory.filter(
      (item: string) =>
        item.toLowerCase().includes(value.toLowerCase()) &&
        !suggestions.includes(item)
    ),
  ].slice(0, 8)

  // Debounced search
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      const timer = setTimeout(() => {
        onSearch(query)
        setSearchQuery(query)
        if (query.trim()) {
          addToSearchHistory(query)
        }
      }, 300)

      setDebounceTimer(timer)
    },
    [onSearch, setSearchQuery, addToSearchHistory, debounceTimer]
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSearch(newValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSearch(value)
      setSearchQuery(value)
      addToSearchHistory(value)
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setValue(suggestion)
    onSearch(suggestion)
    setSearchQuery(suggestion)
    addToSearchHistory(suggestion)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  // Handle clear search
  const handleClear = () => {
    setValue('')
    onSearch('')
    setSearchQuery('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSuggestionSelect(allSuggestions[selectedIndex])
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }

    if (showShortcuts) {
      document.addEventListener('keydown', handleGlobalKeyDown)
      return () => document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [showShortcuts])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            aria-label="Search"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            autoComplete="off"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showShortcuts && !value && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          )}
        </div>
      </form>

      {/* Search suggestions dropdown */}
      {isOpen && (allSuggestions.length > 0 || searchHistory.length > 0) && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          role="listbox"
          aria-label="Search suggestions"
        >
          {allSuggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">
                {value ? 'Suggestions' : 'Recent searches'}
              </div>
              {allSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
                    selectedIndex === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>{suggestion}</span>
                  {searchHistory.includes(suggestion) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromSearchHistory(suggestion)
                      }}
                      className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={`Remove "${suggestion}" from history`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
