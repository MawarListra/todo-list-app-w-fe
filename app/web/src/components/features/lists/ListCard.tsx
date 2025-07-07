import React from 'react'
import {
  MoreHorizontal,
  Calendar,
  CheckCircle,
  Circle,
  Trash2,
  Edit,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { List, ListWithStats } from '@/types/list.types'

export interface ListCardProps {
  list: ListWithStats
  onEdit?: (list: List) => void
  onDelete?: (list: List) => void
  onSelect?: (list: List) => void
  loading?: boolean
  selected?: boolean
  className?: string
}

export const ListCard: React.FC<ListCardProps> = ({
  list,
  onEdit,
  onDelete,
  onSelect,
  loading = false,
  selected = false,
  className,
}) => {
  const [showActions, setShowActions] = React.useState(false)

  // Click outside hook for actions menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActions) {
        setShowActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showActions])

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(list)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(list)
  }

  const handleSelect = () => {
    onSelect?.(list)
  }

  const completionPercentage = list.completionPercentage || 0
  const isActive = list.taskCount > 0
  const isEmpty = list.taskCount === 0

  if (loading) {
    return (
      <Card className={cn('p-4', className)}>
        <LoadingSkeleton height={24} className="mb-2" />
        <LoadingSkeleton height={16} width="80%" className="mb-4" />
        <div className="flex items-center justify-between">
          <LoadingSkeleton height={16} width="40%" />
          <LoadingSkeleton height={16} width="30%" />
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
        selected && 'ring-2 ring-primary-500 border-primary-300',
        isEmpty && 'opacity-75',
        className
      )}
      onClick={handleSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {list.name}
          </h3>
          {list.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {list.description}
            </p>
          )}
        </div>

        <div className="relative ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className="p-1"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>

          {showActions && (
            <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]">
              <button
                onClick={handleEdit}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Task Progress */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {isActive ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-gray-600">
              {list.completedTaskCount} of {list.taskCount} tasks
            </span>
          </div>

          {isActive && (
            <span className="text-gray-500 font-medium">
              {Math.round(completionPercentage)}%
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">No tasks yet</p>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Updated {formatRelativeTime(list.updatedAt)}</span>
          </div>

          {list.recentActivity && (
            <span>Activity {formatRelativeTime(list.recentActivity)}</span>
          )}
        </div>
      </div>
    </Card>
  )
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}
