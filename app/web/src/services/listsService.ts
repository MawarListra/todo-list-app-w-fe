import { api } from './httpClient'
import {
  List,
  ListCreateData,
  ListUpdateData,
  ListWithStats,
} from '../types/list.types'
import { Task } from '../types/task.types'

export interface ListsQueryOptions {
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'taskCount'
  sortDirection?: 'asc' | 'desc'
  search?: string
  limit?: number
  offset?: number
}

export interface ListTasksQueryOptions {
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
  limit?: number
  offset?: number
}

export const listsService = {
  /**
   * Get all lists with optional filtering and sorting
   */
  async getLists(options: ListsQueryOptions = {}): Promise<ListWithStats[]> {
    const params = new URLSearchParams()

    if (options.sortBy) params.append('sortBy', options.sortBy)
    if (options.sortDirection)
      params.append('sortDirection', options.sortDirection)
    if (options.search) params.append('search', options.search)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.offset) params.append('offset', options.offset.toString())

    const response = await api.get<ListWithStats[]>(
      `/lists?${params.toString()}`
    )
    return response
  },

  /**
   * Get a specific list by ID
   */
  async getList(id: string): Promise<List> {
    const response = await api.get<List>(`/lists/${id}`)
    return response
  },

  /**
   * Create a new list
   */
  async createList(data: ListCreateData): Promise<List> {
    const response = await api.post<List>('/lists', data)
    return response
  },

  /**
   * Update an existing list
   */
  async updateList(id: string, data: ListUpdateData): Promise<List> {
    const response = await api.put<List>(`/lists/${id}`, data)
    return response
  },

  /**
   * Delete a list
   */
  async deleteList(id: string): Promise<void> {
    await api.delete(`/lists/${id}`)
  },

  /**
   * Get all tasks in a specific list
   */
  async getListTasks(
    listId: string,
    options: ListTasksQueryOptions = {}
  ): Promise<Task[]> {
    const params = new URLSearchParams()

    if (options.sortBy) params.append('sortBy', options.sortBy)
    if (options.sortDirection)
      params.append('sortDirection', options.sortDirection)
    if (options.completed !== undefined)
      params.append('completed', options.completed.toString())
    if (options.priority) params.append('priority', options.priority)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.offset) params.append('offset', options.offset.toString())

    const response = await api.get<Task[]>(
      `/lists/${listId}/tasks?${params.toString()}`
    )
    return response
  },

  /**
   * Get list statistics
   */
  async getListStats(id: string): Promise<{
    taskCount: number
    completedTaskCount: number
    completionPercentage: number
    overdueTasks: number
    dueTodayTasks: number
    dueThisWeekTasks: number
  }> {
    const response = await api.get<{
      taskCount: number
      completedTaskCount: number
      completionPercentage: number
      overdueTasks: number
      dueTodayTasks: number
      dueThisWeekTasks: number
    }>(`/lists/${id}/stats`)
    return response
  },

  /**
   * Duplicate a list
   */
  async duplicateList(id: string, newName?: string): Promise<List> {
    const response = await api.post<List>(`/lists/${id}/duplicate`, {
      name: newName,
    })
    return response
  },

  /**
   * Archive a list
   */
  async archiveList(id: string): Promise<List> {
    const response = await api.patch<List>(`/lists/${id}/archive`)
    return response
  },

  /**
   * Unarchive a list
   */
  async unarchiveList(id: string): Promise<List> {
    const response = await api.patch<List>(`/lists/${id}/unarchive`)
    return response
  },
}
