import { api } from './httpClient'
import { Task, TaskCreateData, TaskUpdateData } from '../types/task.types'

export interface TasksQueryOptions {
  listId?: string
  sortBy?:
    | 'title'
    | 'createdAt'
    | 'updatedAt'
    | 'priority'
    | 'deadline'
    | 'order'
  sortDirection?: 'asc' | 'desc'
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  search?: string
  dueDate?: 'today' | 'this-week' | 'overdue'
  limit?: number
  offset?: number
}

export interface BulkTaskUpdate {
  ids: string[]
  data: Partial<TaskUpdateData>
}

export interface TaskMoveData {
  taskId: string
  targetListId: string
  newOrder?: number
}

export const tasksService = {
  /**
   * Get all tasks with optional filtering and sorting
   */
  async getTasks(options: TasksQueryOptions = {}): Promise<Task[]> {
    const params = new URLSearchParams()

    if (options.listId) params.append('listId', options.listId)
    if (options.sortBy) params.append('sortBy', options.sortBy)
    if (options.sortDirection)
      params.append('sortDirection', options.sortDirection)
    if (options.completed !== undefined)
      params.append('completed', options.completed.toString())
    if (options.priority) params.append('priority', options.priority)
    if (options.search) params.append('search', options.search)
    if (options.dueDate) params.append('dueDate', options.dueDate)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.offset) params.append('offset', options.offset.toString())

    const response = await api.get<Task[]>(`/tasks?${params.toString()}`)
    return response
  },

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`)
    return response
  },

  /**
   * Create a new task
   */
  async createTask(data: TaskCreateData): Promise<Task> {
    const response = await api.post<Task>('/tasks', data)
    return response
  },

  /**
   * Update an existing task
   */
  async updateTask(id: string, data: TaskUpdateData): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, data)
    return response
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(id: string): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}/toggle`)
    return response
  },

  /**
   * Bulk update multiple tasks
   */
  async bulkUpdateTasks(data: BulkTaskUpdate): Promise<Task[]> {
    const response = await api.patch<Task[]>('/tasks/bulk', data)
    return response
  },

  /**
   * Bulk delete multiple tasks
   */
  async bulkDeleteTasks(ids: string[]): Promise<void> {
    await api.delete('/tasks/bulk', { data: { ids } })
  },

  /**
   * Move task to a different list
   */
  async moveTask(data: TaskMoveData): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${data.taskId}/move`, {
      targetListId: data.targetListId,
      newOrder: data.newOrder,
    })
    return response
  },

  /**
   * Reorder tasks within a list
   */
  async reorderTasks(listId: string, taskIds: string[]): Promise<Task[]> {
    const response = await api.patch<Task[]>(`/tasks/reorder`, {
      listId,
      taskIds,
    })
    return response
  },

  /**
   * Duplicate a task
   */
  async duplicateTask(id: string, newTitle?: string): Promise<Task> {
    const response = await api.post<Task>(`/tasks/${id}/duplicate`, {
      title: newTitle,
    })
    return response
  },

  /**
   * Set task priority
   */
  async setTaskPriority(
    id: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}/priority`, {
      priority,
    })
    return response
  },

  /**
   * Set task deadline
   */
  async setTaskDeadline(id: string, deadline: Date | null): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}/deadline`, {
      deadline,
    })
    return response
  },

  /**
   * Get tasks due today
   */
  async getTasksDueToday(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks/due-today')
    return response
  },

  /**
   * Get tasks due this week
   */
  async getTasksDueThisWeek(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks/due-this-week')
    return response
  },

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks/overdue')
    return response
  },

  /**
   * Search tasks
   */
  async searchTasks(
    query: string,
    options: Omit<TasksQueryOptions, 'search'> = {}
  ): Promise<Task[]> {
    const params = new URLSearchParams()
    params.append('search', query)

    if (options.listId) params.append('listId', options.listId)
    if (options.sortBy) params.append('sortBy', options.sortBy)
    if (options.sortDirection)
      params.append('sortDirection', options.sortDirection)
    if (options.completed !== undefined)
      params.append('completed', options.completed.toString())
    if (options.priority) params.append('priority', options.priority)
    if (options.dueDate) params.append('dueDate', options.dueDate)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.offset) params.append('offset', options.offset.toString())

    const response = await api.get<Task[]>(`/tasks/search?${params.toString()}`)
    return response
  },
}
