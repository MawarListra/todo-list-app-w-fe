import React from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Task } from '../../../types/task.types'
import { List } from '../../../types/list.types'

export interface TaskDragDropProps {
  tasks: Task[]
  lists?: List[]
  onTaskMove?: (taskId: string, newListId: string, newIndex: number) => void
  onTaskReorder?: (listId: string, taskIds: string[]) => void
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

interface DraggableTaskProps {
  task: Task
  children: React.ReactNode
  disabled?: boolean
}

const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  children,
  disabled,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
      {...attributes}
    >
      <div className="group relative">
        {!disabled && (
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
        )}
        <div className={!disabled ? 'pl-8' : ''}>{children}</div>
      </div>
    </div>
  )
}

export const TaskDragDrop: React.FC<TaskDragDropProps> = ({
  tasks,
  lists = [],
  onTaskMove,
  onTaskReorder,
  disabled = false,
  className = '',
  children,
}) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If dropping over a list container
    const overList = lists.find((list) => list.id === overId)
    if (overList) {
      const activeTask = tasks.find((task) => task.id === activeId)
      if (activeTask && activeTask.listId !== overList.id) {
        // Moving task to different list
        onTaskMove?.(activeId, overList.id, 0)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    // Find the active task
    const activeTask = tasks.find((task) => task.id === activeId)
    if (!activeTask) return

    // Check if dropping over a list container
    const overList = lists.find((list) => list.id === overId)
    if (overList) {
      if (activeTask.listId !== overList.id) {
        // Moving task to different list
        onTaskMove?.(activeId, overList.id, 0)
      }
      return
    }

    // Check if dropping over another task
    const overTask = tasks.find((task) => task.id === overId)
    if (overTask && activeTask.listId === overTask.listId) {
      // Reordering within the same list
      const listTasks = tasks.filter(
        (task) => task.listId === activeTask.listId
      )
      const oldIndex = listTasks.findIndex((task) => task.id === activeId)
      const newIndex = listTasks.findIndex((task) => task.id === overId)

      if (oldIndex !== newIndex) {
        const reorderedTasks = arrayMove(listTasks, oldIndex, newIndex)
        onTaskReorder?.(
          activeTask.listId,
          reorderedTasks.map((task: Task) => task.id)
        )
      }
    } else if (overTask && activeTask.listId !== overTask.listId) {
      // Moving task to different list
      const overListTasks = tasks.filter(
        (task) => task.listId === overTask.listId
      )
      const newIndex = overListTasks.findIndex((task) => task.id === overId)
      onTaskMove?.(activeId, overTask.listId, newIndex)
    }
  }

  // Group tasks by list for rendering
  const tasksByList = React.useMemo(() => {
    const grouped = new Map<string, Task[]>()
    tasks.forEach((task) => {
      const listTasks = grouped.get(task.listId) || []
      listTasks.push(task)
      grouped.set(task.listId, listTasks)
    })
    return grouped
  }, [tasks])

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={className}>
        {Array.from(tasksByList.entries()).map(([listId, listTasks]) => (
          <SortableContext
            key={listId}
            items={listTasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              data-list-id={listId}
              className="min-h-[50px] transition-colors rounded-lg"
            >
              {children}
            </div>
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 opacity-90">
            <div className="font-medium text-gray-900">{activeTask.title}</div>
            {activeTask.description && (
              <div className="text-sm text-gray-600 mt-1">
                {activeTask.description}
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activeTask.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : activeTask.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {activeTask.priority}
              </span>
              {activeTask.deadline && (
                <span className="text-xs text-gray-500">
                  Due: {new Date(activeTask.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

// Export the DraggableTask component for use in task cards
export { DraggableTask }
