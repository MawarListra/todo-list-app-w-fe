import React from 'react'
import { X, Filter } from 'lucide-react'
import {
  useFilterStore,
  Priority,
  TaskStatus,
} from '../../../stores/filterStore'

export interface FilterTagsProps {
  onRemoveFilter?: (filterType: string, value?: string) => void
  onClearAll?: () => void
  className?: string
}

export const FilterTags: React.FC<FilterTagsProps> = ({
  onRemoveFilter,
  onClearAll,
  className = '',
}) => {
  const {
    taskFilters,
    setTaskFilters,
    clearTaskFilters,
    searchQuery,
    setSearchQuery,
  } = useFilterStore()

  // Helper to remove priority filter
  const removePriorityFilter = (priority: Priority) => {
    const newPriorities = taskFilters.priority.filter((p) => p !== priority)
    const updatedFilters = { ...taskFilters, priority: newPriorities }
    setTaskFilters(updatedFilters)
    onRemoveFilter?.('priority', priority)
  }

  // Helper to remove status filter
  const removeStatusFilter = () => {
    const updatedFilters = { ...taskFilters, status: 'all' as TaskStatus }
    setTaskFilters(updatedFilters)
    onRemoveFilter?.('status')
  }

  // Helper to remove date range filter
  const removeDateRangeFilter = (field: 'start' | 'end') => {
    const updatedFilters = {
      ...taskFilters,
      dateRange: {
        ...taskFilters.dateRange,
        [field]: null,
      },
    }
    setTaskFilters(updatedFilters)
    onRemoveFilter?.('dateRange', field)
  }

  // Helper to remove search query
  const removeSearchQuery = () => {
    setSearchQuery('')
    onRemoveFilter?.('search')
  }

  // Helper to clear all filters
  const handleClearAll = () => {
    clearTaskFilters()
    setSearchQuery('')
    onClearAll?.()
  }

  // Get all active filters
  const activeFilters: Array<{
    type: string
    label: string
    value?: string
    onRemove: () => void
  }> = []

  // Add search query
  if (searchQuery) {
    activeFilters.push({
      type: 'search',
      label: `Search: "${searchQuery}"`,
      onRemove: removeSearchQuery,
    })
  }

  // Add priority filters
  taskFilters.priority.forEach((priority) => {
    activeFilters.push({
      type: 'priority',
      label: `Priority: ${priority}`,
      value: priority,
      onRemove: () => removePriorityFilter(priority),
    })
  })

  // Add status filter
  if (taskFilters.status !== 'all') {
    activeFilters.push({
      type: 'status',
      label: `Status: ${taskFilters.status}`,
      onRemove: removeStatusFilter,
    })
  }

  // Add date range filters
  if (taskFilters.dateRange.start) {
    activeFilters.push({
      type: 'dateRange',
      label: `From: ${taskFilters.dateRange.start.toLocaleDateString()}`,
      value: 'start',
      onRemove: () => removeDateRangeFilter('start'),
    })
  }

  if (taskFilters.dateRange.end) {
    activeFilters.push({
      type: 'dateRange',
      label: `To: ${taskFilters.dateRange.end.toLocaleDateString()}`,
      value: 'end',
      onRemove: () => removeDateRangeFilter('end'),
    })
  }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Filter className="h-4 w-4" />
        <span>Active filters:</span>
      </div>

      {activeFilters.map((filter, index) => (
        <span
          key={`${filter.type}-${filter.value || index}`}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter.type === 'search'
              ? 'bg-blue-100 text-blue-800'
              : filter.type === 'priority'
                ? 'bg-purple-100 text-purple-800'
                : filter.type === 'status'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
          }`}
        >
          {filter.label}
          <button
            onClick={filter.onRemove}
            className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={handleClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
        >
          Clear all
        </button>
      )}

      <div className="text-sm text-gray-500">
        {activeFilters.length} filter{activeFilters.length === 1 ? '' : 's'}{' '}
        active
      </div>
    </div>
  )
}
