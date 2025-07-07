import React, { useState } from 'react'
import {
  Filter,
  X,
  ChevronDown,
  Calendar,
  Flag,
  CheckSquare,
} from 'lucide-react'
import {
  useFilterStore,
  TaskFilters,
  Priority,
  TaskStatus,
} from '../../../stores/filterStore'

export interface FilterPanelProps {
  onFilterChange?: (filters: Partial<TaskFilters>) => void
  onClearAll?: () => void
  counts?: {
    total: number
    high: number
    medium: number
    low: number
    completed: number
    pending: number
    overdue: number
  }
  className?: string
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  onClearAll,
  counts,
  className = '',
}) => {
  const { taskFilters, setTaskFilters, clearTaskFilters } = useFilterStore()

  const [isOpen, setIsOpen] = useState(false)

  // Handle priority filter change
  const handlePriorityChange = (priority: Priority, checked: boolean) => {
    const newPriorities = checked
      ? [...taskFilters.priority, priority]
      : taskFilters.priority.filter((p) => p !== priority)

    const updatedFilters = { ...taskFilters, priority: newPriorities }
    setTaskFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
  }

  // Handle status filter change
  const handleStatusChange = (status: TaskStatus) => {
    const updatedFilters = { ...taskFilters, status }
    setTaskFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
  }

  // Handle date range change
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : null
    const updatedFilters = {
      ...taskFilters,
      dateRange: {
        ...taskFilters.dateRange,
        [field]: date,
      },
    }
    setTaskFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
  }

  // Handle clear all filters
  const handleClearAll = () => {
    clearTaskFilters()
    onClearAll?.()
  }

  // Check if any filters are active
  const hasActiveFilters =
    taskFilters.priority.length > 0 ||
    taskFilters.status !== 'all' ||
    taskFilters.dateRange.start ||
    taskFilters.dateRange.end

  // Count active filters
  const activeFilterCount =
    taskFilters.priority.length +
    (taskFilters.status !== 'all' ? 1 : 0) +
    (taskFilters.dateRange.start ? 1 : 0) +
    (taskFilters.dateRange.end ? 1 : 0)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
          hasActiveFilters
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Priority Filters */}
            <div className="mb-6">
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Flag className="h-4 w-4" />
                Priority
              </h4>
              <div className="space-y-2">
                {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
                  <label
                    key={priority}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={taskFilters.priority.includes(priority)}
                      onChange={(e) =>
                        handlePriorityChange(priority, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                    {counts && (
                      <span className="text-xs text-gray-500">
                        ({counts[priority]})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div className="mb-6">
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <CheckSquare className="h-4 w-4" />
                Status
              </h4>
              <div className="space-y-2">
                {(
                  [
                    { value: 'all', label: 'All tasks' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'overdue', label: 'Overdue' },
                  ] as { value: TaskStatus; label: string }[]
                ).map((status) => (
                  <label
                    key={status.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={taskFilters.status === status.value}
                      onChange={() => handleStatusChange(status.value)}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {status.label}
                    </span>
                    {counts && status.value !== 'all' && (
                      <span className="text-xs text-gray-500">
                        ({counts[status.value as keyof typeof counts]})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="mb-4">
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Calendar className="h-4 w-4" />
                Date Range
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={
                      taskFilters.dateRange.start
                        ?.toISOString()
                        .split('T')[0] || ''
                    }
                    onChange={(e) =>
                      handleDateRangeChange('start', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={
                      taskFilters.dateRange.end?.toISOString().split('T')[0] ||
                      ''
                    }
                    onChange={(e) =>
                      handleDateRangeChange('end', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
