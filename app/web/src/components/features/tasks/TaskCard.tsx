import React from 'react'
import { Check, Clock, Flag, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Task } from '@/types/task.types'

export interface TaskCardProps {
  task: Task
  onToggle?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onSelect?: (task: Task) => void
  isDragging?: boolean
  selected?: boolean
  className?: string
}

const priorityColors = {
  low: 'text-blue-600 bg-blue-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-red-600 bg-red-100',
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onSelect,
  isDragging = false,
  selected = false,
  className,
}) => {
  const [showActions, setShowActions] = React.useState(false)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle?.(task)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowActions(false)
    onEdit?.(task)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowActions(false)
    onDelete?.(task)
  }

  const handleSelect = () => {
    onSelect?.(task)
  }

  const isOverdue =
    task.deadline && new Date(task.deadline) < new Date() && !task.completed
  const isDueToday =
    task.deadline &&
    new Date(task.deadline).toDateString() === new Date().toDateString()

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        selected && 'ring-2 ring-primary-500 border-primary-300',
        task.completed && 'opacity-75',
        isDragging && 'opacity-50 rotate-2 shadow-lg',
        isOverdue && 'border-red-200 bg-red-50',
        className
      )}
      onClick={handleSelect}
    >
      <div className="flex items-start space-x-3">
        {/* Completion Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center',
            'transition-colors duration-200',
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          )}
        >
          {task.completed && <Check className="w-3 h-3" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className={cn(
                  'text-sm font-medium text-gray-900',
                  task.completed && 'line-through text-gray-500'
                )}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className={cn(
                    'text-sm text-gray-600 mt-1 line-clamp-2',
                    task.completed && 'text-gray-400'
                  )}
                >
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(!showActions)
                }}
                className="p-1 opacity-0 group-hover:opacity-100"
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

          {/* Task Meta Information */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              {/* Priority Badge */}
              <span
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  priorityColors[task.priority]
                )}
              >
                <Flag className="w-3 h-3 mr-1" />
                {task.priority}
              </span>
            </div>

            {/* Due Date */}
            {task.deadline && (
              <div
                className={cn(
                  'flex items-center text-xs',
                  isOverdue && 'text-red-600',
                  isDueToday && !isOverdue && 'text-orange-600',
                  !isOverdue && !isDueToday && 'text-gray-500'
                )}
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatDueDate(task.deadline)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Helper function to format due dates
function formatDueDate(date: Date): string {
  const now = new Date()
  const taskDate = new Date(date)
  const timeDiff = taskDate.getTime() - now.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

  if (daysDiff < 0) {
    return `${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} overdue`
  } else if (daysDiff === 0) {
    return 'Due today'
  } else if (daysDiff === 1) {
    return 'Due tomorrow'
  } else if (daysDiff <= 7) {
    return `Due in ${daysDiff} days`
  } else {
    return taskDate.toLocaleDateString()
  }
}
