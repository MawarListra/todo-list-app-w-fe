export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  deadline?: Date
  createdAt: Date
  updatedAt: Date
  listId: string
  userId?: string
  order?: number
}

export interface TaskCreateData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  deadline?: Date
  listId: string
  order?: number
}

export interface TaskUpdateData {
  title?: string
  description?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  deadline?: Date
  order?: number
}

export type TaskSortBy =
  | 'title'
  | 'createdAt'
  | 'updatedAt'
  | 'priority'
  | 'deadline'
  | 'order'
export type TaskFilterBy =
  | 'all'
  | 'active'
  | 'completed'
  | 'overdue'
  | 'due-today'
  | 'due-this-week'

export interface TaskStats {
  total: number
  completed: number
  active: number
  overdue: number
  dueToday: number
  dueThisWeek: number
  highPriority: number
  mediumPriority: number
  lowPriority: number
}
