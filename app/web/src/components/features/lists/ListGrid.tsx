import React from 'react'
import {
  Plus,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { SelectInput } from '@/components/ui/SelectInput'
import { Container } from '@/components/ui/Container'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ListCard } from './ListCard'
import { useFilters } from '@/hooks/useFilters'
import {
  List,
  ListWithStats,
  ListSortBy,
  ListFilterBy,
} from '@/types/list.types'

export interface ListGridProps {
  lists: ListWithStats[]
  onListCreate?: () => void
  onListUpdate?: (list: List) => void
  onListDelete?: (list: List) => void
  onListSelect?: (list: List) => void
  loading?: boolean
  selectedListId?: string
  className?: string
}

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'taskCount', label: 'Task Count' },
  { value: 'completionPercentage', label: 'Completion' },
]

const filterOptions = [
  { value: 'all', label: 'All Lists' },
  { value: 'active', label: 'Active Lists' },
  { value: 'completed', label: 'Completed Lists' },
  { value: 'empty', label: 'Empty Lists' },
]

export const ListGrid: React.FC<ListGridProps> = ({
  lists,
  onListCreate,
  onListUpdate,
  onListDelete,
  onListSelect,
  loading = false,
  selectedListId,
  className,
}) => {
  // Use centralized filter store
  const {
    searchQuery,
    listFilters,
    listSort,
    viewMode,
    setSearchQuery,
    setListFilters,
    setListSort,
    setViewMode,
    processListsData,
    filterSummary,
  } = useFilters()

  // Process lists using centralized filtering
  const processedLists = React.useMemo(() => {
    return processListsData(lists)
  }, [lists, processListsData])

  const handleSortChange = (newSortBy: string) => {
    const currentDirection = listSort.direction
    setListSort({
      field: newSortBy,
      direction:
        newSortBy === listSort.field && currentDirection === 'asc'
          ? 'desc'
          : 'asc',
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (filter: string) => {
    // Update list filters to match the filter store structure
    setListFilters({
      ...listFilters,
      dateRange: listFilters.dateRange, // keep existing dateRange
    })
  }

  if (loading) {
    return (
      <Container className={cn('py-6', className)}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <LoadingSkeleton height={32} width={200} />
            <LoadingSkeleton height={40} width={120} />
          </div>

          {/* Controls skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <LoadingSkeleton height={40} className="flex-1" />
            <LoadingSkeleton height={40} width={150} />
            <LoadingSkeleton height={40} width={150} />
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} height={180} />
            ))}
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className={cn('py-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Lists</h1>
            <p className="text-gray-600 mt-1">
              {processedLists.length} of {lists.length} lists
            </p>
          </div>

          <Button
            onClick={onListCreate}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New List</span>
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <TextInput
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <SelectInput
              value={sortBy}
              options={sortOptions}
              onChange={(value) => handleSortChange(value as string)}
              className="w-40"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }
            >
              {sortDirection === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Filter */}
          <SelectInput
            value={filterBy}
            options={filterOptions}
            onChange={(value) => handleFilter(value as string)}
            className="w-40"
            icon={<Filter className="w-4 h-4" />}
          />

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('list')}
              className="rounded-l-none border-l-0"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Empty state */}
        {filteredAndSortedLists.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ListIcon className="w-12 h-12 text-gray-400" />
            </div>
            {searchQuery || filterBy !== 'all' ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No lists found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onSearchChange?.('')
                    onFilterChange?.('all')
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No lists yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first task list
                </p>
                <Button onClick={onListCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create List
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Lists Grid/List */}
        {filteredAndSortedLists.length > 0 && (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-4'
            )}
          >
            {filteredAndSortedLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onEdit={onListUpdate}
                onDelete={onListDelete}
                onSelect={onListSelect}
                selected={selectedListId === list.id}
                className={viewMode === 'list' ? 'max-w-none' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
