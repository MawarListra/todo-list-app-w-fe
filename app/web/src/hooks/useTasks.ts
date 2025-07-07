import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  tasksService,
  TasksQueryOptions,
  BulkTaskUpdate,
  TaskMoveData,
} from '../services/tasksService'
import { queryKeys, invalidationPatterns } from '../services/queryKeys'
import { Task, TaskCreateData, TaskUpdateData } from '../types/task.types'
import { useToast } from './useToast'

export const useTasks = (options: TasksQueryOptions = {}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch tasks query
  const tasksQuery = useQuery({
    queryKey: queryKeys.filteredTasks(options),
    queryFn: () => tasksService.getTasks(options),
    staleTime: 2 * 60 * 1000, // 2 minutes (tasks change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskCreateData) => tasksService.createTask(data),
    onSuccess: (newTask) => {
      // Update the cache with the new task
      queryClient.setQueryData<Task[]>(
        queryKeys.filteredTasks(options),
        (oldTasks = []) => [...oldTasks, newTask]
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
      if (newTask.listId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.listTasks(newTask.listId),
        })
      }

      toast.success(`"${newTask.title}" has been created successfully.`, {
        title: 'Task Created',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while creating the task.',
        {
          title: 'Failed to Create Task',
        }
      )
    },
  })

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskUpdateData }) =>
      tasksService.updateTask(id, data),
    onSuccess: (updatedTask) => {
      // Update the cache with the updated task
      queryClient.setQueryData<Task[]>(
        queryKeys.filteredTasks(options),
        (oldTasks = []) =>
          oldTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
      )

      // Invalidate related queries
      invalidationPatterns
        .invalidateTask(updatedTask.id, updatedTask.listId)
        .forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey })
        })

      toast.success(`"${updatedTask.title}" has been updated successfully.`, {
        title: 'Task Updated',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while updating the task.',
        {
          title: 'Failed to Update Task',
        }
      )
    },
  })

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: (_, deletedId) => {
      // Remove the task from cache
      queryClient.setQueryData<Task[]>(
        queryKeys.filteredTasks(options),
        (oldTasks = []) => oldTasks.filter((task) => task.id !== deletedId)
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })

      toast.success('The task has been deleted successfully.', {
        title: 'Task Deleted',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while deleting the task.',
        {
          title: 'Failed to Delete Task',
        }
      )
    },
  })

  // Toggle task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: (id: string) => tasksService.toggleTaskCompletion(id),
    onSuccess: (updatedTask) => {
      // Update the cache with the toggled task
      queryClient.setQueryData<Task[]>(
        queryKeys.filteredTasks(options),
        (oldTasks = []) =>
          oldTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
      )

      // Invalidate related queries
      invalidationPatterns
        .invalidateTask(updatedTask.id, updatedTask.listId)
        .forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey })
        })

      const message = updatedTask.completed
        ? `"${updatedTask.title}" has been completed.`
        : `"${updatedTask.title}" has been marked as incomplete.`

      toast.success(message, {
        title: 'Task Updated',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while updating the task.',
        {
          title: 'Failed to Update Task',
        }
      )
    },
  })

  // Bulk update tasks mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (data: BulkTaskUpdate) => tasksService.bulkUpdateTasks(data),
    onSuccess: (updatedTasks) => {
      // Update the cache with the updated tasks
      queryClient.setQueryData<Task[]>(
        queryKeys.filteredTasks(options),
        (oldTasks = []) =>
          oldTasks.map((task) => {
            const updatedTask = updatedTasks.find((t) => t.id === task.id)
            return updatedTask || task
          })
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })

      toast.success(
        `${updatedTasks.length} tasks have been updated successfully.`,
        {
          title: 'Tasks Updated',
        }
      )
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while updating the tasks.',
        {
          title: 'Failed to Update Tasks',
        }
      )
    },
  })

  // Bulk delete tasks mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => tasksService.bulkDeleteTasks(ids),
    onSuccess: (_, deletedIds) => {
      // Remove the tasks from cache
      queryClient.setQueryData<Task[]>(
        queryKeys.filteredTasks(options),
        (oldTasks = []) =>
          oldTasks.filter((task) => !deletedIds.includes(task.id))
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })

      toast.success(
        `${deletedIds.length} tasks have been deleted successfully.`,
        {
          title: 'Tasks Deleted',
        }
      )
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while deleting the tasks.',
        {
          title: 'Failed to Delete Tasks',
        }
      )
    },
  })

  return {
    // Data
    tasks: tasksQuery.data ?? [],

    // Loading states
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,

    // Mutation states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isToggling: toggleTaskMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,

    // Actions
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    toggleTask: toggleTaskMutation.mutate,
    bulkUpdateTasks: bulkUpdateMutation.mutate,
    bulkDeleteTasks: bulkDeleteMutation.mutate,

    // Utility methods
    refetch: tasksQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  }
}

// Hook for getting a single task
export const useTask = (id: string) => {
  const taskQuery = useQuery({
    queryKey: queryKeys.task(id),
    queryFn: () => tasksService.getTask(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    isError: taskQuery.isError,
    error: taskQuery.error,
    refetch: taskQuery.refetch,
  }
}

// Hook for task operations (move, reorder, etc.)
export const useTaskOperations = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Move task mutation
  const moveTaskMutation = useMutation({
    mutationFn: (data: TaskMoveData) => tasksService.moveTask(data),
    onSuccess: (movedTask) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
      queryClient.invalidateQueries({
        queryKey: queryKeys.listTasks(movedTask.listId),
      })

      toast.success(`"${movedTask.title}" has been moved successfully.`, {
        title: 'Task Moved',
      })
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while moving the task.', {
        title: 'Failed to Move Task',
      })
    },
  })

  // Reorder tasks mutation
  const reorderTasksMutation = useMutation({
    mutationFn: ({ listId, taskIds }: { listId: string; taskIds: string[] }) =>
      tasksService.reorderTasks(listId, taskIds),
    onSuccess: (reorderedTasks) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
      queryClient.invalidateQueries({
        queryKey: queryKeys.listTasks(reorderedTasks[0]?.listId),
      })

      toast.success('Tasks have been reordered successfully.', {
        title: 'Tasks Reordered',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while reordering the tasks.',
        {
          title: 'Failed to Reorder Tasks',
        }
      )
    },
  })

  // Duplicate task mutation
  const duplicateTaskMutation = useMutation({
    mutationFn: ({ id, newTitle }: { id: string; newTitle?: string }) =>
      tasksService.duplicateTask(id, newTitle),
    onSuccess: (duplicatedTask) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
      queryClient.invalidateQueries({
        queryKey: queryKeys.listTasks(duplicatedTask.listId),
      })

      toast.success(`"${duplicatedTask.title}" has been created as a copy.`, {
        title: 'Task Duplicated',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while duplicating the task.',
        {
          title: 'Failed to Duplicate Task',
        }
      )
    },
  })

  return {
    // Mutation states
    isMoving: moveTaskMutation.isPending,
    isReordering: reorderTasksMutation.isPending,
    isDuplicating: duplicateTaskMutation.isPending,

    // Actions
    moveTask: moveTaskMutation.mutate,
    reorderTasks: reorderTasksMutation.mutate,
    duplicateTask: duplicateTaskMutation.mutate,
  }
}
