import React from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { SelectInput } from '@/components/ui/SelectInput'
import { useFilters } from '@/hooks/useFilters'
import { TaskFilterBy } from '@/types/task.types'

export interface FilterBarProps {
  mode: 'tasks' | 'lists'
  className?: string
}

const taskFilterOptions = [
  { value: 'all', label: 'All Tasks' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due-today', label: 'Due Today' },
  { value: 'due-this-week', label: 'Due This Week' },
]

const taskSortOptions = [
  { value: 'title', label: 'Title' },
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'order', label: 'Order' },
]

const listSortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
  { value: 'taskCount', label: 'Task Count' },
  { value: 'completionPercentage', label: 'Completion' },
]

export const FilterBar: React.FC<FilterBarProps> = ({ mode, className }) => {
  const {
    searchQuery,
    taskFilters,
    listFilters,
    taskSort,
    listSort,
    setSearchQuery,
    setTaskFilters,
    setListFilters,
    setTaskSort,
    setListSort,
    clearSearch,
    clearTaskFilters,
    clearListFilters,
    filterSummary,
  } = useFilters()

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleTaskFilterChange = (
    filterType: keyof typeof taskFilters,
    value: any
  ) => {
    setTaskFilters({
      ...taskFilters,
      [filterType]: value,
    })
  }

  const handleListFilterChange = (
    filterType: keyof typeof listFilters,
    value: any
  ) => {
    setListFilters({
      ...listFilters,
      [filterType]: value,
    })
  }

  const handleTaskSortChange = (value: string | string[]) => {
    const field = Array.isArray(value) ? value[0] : value
    setTaskSort(
      field as any,
      taskSort.field === field && taskSort.direction === 'asc' ? 'desc' : 'asc'
    )
  }

  const handleListSortChange = (value: string | string[]) => {
    const field = Array.isArray(value) ? value[0] : value
    setListSort(
      field as any,
      listSort.field === field && listSort.direction === 'asc' ? 'desc' : 'asc'
    )
  }

  const clearFilters = () => {
    clearSearch()
    if (mode === 'tasks') {
      clearTaskFilters()
    } else {
      clearListFilters()
    }
  }

  return (
    <div className={`bg-white border-b border-gray-200 p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <TextInput
              placeholder={`Search ${mode}...`}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {mode === 'tasks' ? (
            <>
              <SelectInput
                value={taskFilters.status}
                options={taskFilterOptions}
                onChange={(value) =>
                  handleTaskFilterChange('status', value as TaskFilterBy)
                }
                className="min-w-[120px]"
              />
              <SelectInput
                value={taskFilters.priority || 'all'}
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
                onChange={(value) =>
                  handleTaskFilterChange(
                    'priority',
                    value === 'all' ? null : value
                  )
                }
                className="min-w-[120px]"
              />
              <SelectInput
                value={taskSort.field}
                options={taskSortOptions}
                onChange={handleTaskSortChange}
                className="min-w-[120px]"
              />
            </>
          ) : (
            <>
              <SelectInput
                value={listFilters.showEmpty ? 'all' : 'non-empty'}
                options={[
                  { value: 'all', label: 'All Lists' },
                  { value: 'non-empty', label: 'Non-Empty' },
                ]}
                onChange={(value) =>
                  handleListFilterChange('showEmpty', value === 'all')
                }
                className="min-w-[120px]"
              />
              <SelectInput
                value={listFilters.showCompleted ? 'all' : 'incomplete'}
                options={[
                  { value: 'all', label: 'All Lists' },
                  { value: 'incomplete', label: 'Incomplete Only' },
                ]}
                onChange={(value) =>
                  handleListFilterChange('showCompleted', value === 'all')
                }
                className="min-w-[120px]"
              />
              <SelectInput
                value={listSort.field}
                options={listSortOptions}
                onChange={handleListSortChange}
                className="min-w-[120px]"
              />
            </>
          )}
        </div>

        {/* Clear filters */}
        {filterSummary.hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-1" />
            Clear ({filterSummary.activeCount})
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {filterSummary.hasActiveFilters && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Active filters: {filterSummary.activeFilters.join(', ')}</span>
        </div>
      )}
    </div>
  )
}
