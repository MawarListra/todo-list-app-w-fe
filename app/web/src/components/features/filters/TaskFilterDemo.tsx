import React from 'react'
import { FilterBar } from '@/components/features/filters/FilterBar'
import { TaskCard } from '@/components/features/tasks/TaskCard'
import { useFilters } from '@/hooks/useFilters'
import { Task } from '@/types/task.types'

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the new feature',
    completed: false,
    priority: 'high',
    deadline: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    listId: 'list1',
    order: 1,
  },
  {
    id: '2',
    title: 'Review code changes',
    description: 'Review the pull request from the team',
    completed: true,
    priority: 'medium',
    deadline: new Date('2024-01-12'),
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-11'),
    listId: 'list1',
    order: 2,
  },
  {
    id: '3',
    title: 'Update dependencies',
    description: 'Update all npm dependencies to latest versions',
    completed: false,
    priority: 'low',
    deadline: new Date('2024-01-20'),
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
    listId: 'list2',
    order: 3,
  },
  {
    id: '4',
    title: 'Fix urgent bug',
    description: 'Fix the critical bug in the payment system',
    completed: false,
    priority: 'high',
    deadline: new Date('2024-01-11'), // Overdue
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
    listId: 'list1',
    order: 4,
  },
]

export const TaskFilterDemo: React.FC = () => {
  const { processTasksData } = useFilters()

  // Process tasks using the centralized filter store
  const filteredTasks = React.useMemo(() => {
    return processTasksData(mockTasks)
  }, [processTasksData])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Task Filter Demo
        </h1>
        <p className="text-gray-600">
          This demonstrates the centralized filter store in action. Try
          searching, filtering, and sorting tasks.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar mode="tasks" className="mb-6 rounded-lg shadow-sm" />

      {/* Task Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Tasks ({filteredTasks.length})
          </h2>
          <div className="text-sm text-gray-500">
            Showing {filteredTasks.length} of {mockTasks.length} tasks
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">
              No tasks match your current filters
            </div>
            <div className="text-sm text-gray-400">
              Try adjusting your search or filter criteria
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={(task) => console.log('Toggle task:', task.id)}
                onEdit={(task) => console.log('Edit task:', task.id)}
                onDelete={(task) => console.log('Delete task:', task.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Debug Information
        </h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Total tasks: {mockTasks.length}</div>
          <div>Filtered tasks: {filteredTasks.length}</div>
          <div>
            Mock data includes: High priority urgent bug (overdue), completed
            code review, and other tasks
          </div>
        </div>
      </div>
    </div>
  )
}
