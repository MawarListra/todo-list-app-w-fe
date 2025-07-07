export interface List {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  taskCount: number
  completedTaskCount: number
  userId?: string
}

export interface ListCreateData {
  name: string
  description?: string
}

export interface ListUpdateData {
  name?: string
  description?: string
}

export interface ListWithStats extends List {
  completionPercentage: number
  recentActivity?: Date
}

export type ListSortBy =
  | 'name'
  | 'createdAt'
  | 'updatedAt'
  | 'taskCount'
  | 'completionPercentage'
export type ListFilterBy = 'all' | 'active' | 'completed' | 'empty'
