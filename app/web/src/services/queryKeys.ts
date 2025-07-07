/**
 * Query key factory for consistent query key generation
 * This ensures proper cache invalidation and hierarchical key structure
 */

// Base query keys
export const queryKeys = {
  // Lists
  lists: ['lists'] as const,
  list: (id: string) => ['lists', id] as const,
  listTasks: (listId: string) => ['lists', listId, 'tasks'] as const,

  // Tasks
  tasks: ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,
  tasksByList: (listId: string) => ['tasks', 'list', listId] as const,

  // Filtered/sorted queries
  filteredTasks: (options: {
    listId?: string
    priority?: 'low' | 'medium' | 'high'
    completed?: boolean
    search?: string
    sortBy?: string
    sortDirection?: string
    dueDate?: string
  }) => ['tasks', 'filtered', options] as const,

  filteredLists: (options: {
    search?: string
    sortBy?: string
    sortDirection?: string
    showEmpty?: boolean
  }) => ['lists', 'filtered', options] as const,

  // Analytics
  analytics: ['analytics'] as const,
  taskStats: () => ['analytics', 'task-stats'] as const,
  productivityInsights: () => ['analytics', 'productivity'] as const,
  dueThisWeek: () => ['analytics', 'due-this-week'] as const,
  overdueTasks: () => ['analytics', 'overdue'] as const,
  recentActivity: () => ['analytics', 'recent-activity'] as const,

  // Dashboard
  dashboard: ['dashboard'] as const,
  dashboardData: () => ['dashboard', 'data'] as const,

  // Search
  search: (query: string) => ['search', query] as const,
  searchTasks: (query: string) => ['search', 'tasks', query] as const,
  searchLists: (query: string) => ['search', 'lists', query] as const,

  // Authentication
  auth: {
    profile: () => ['auth', 'profile'] as const,
    user: () => ['auth', 'user'] as const,
  },

  // Infinite queries
} as const

// Type helpers for query keys
export type QueryKey = (typeof queryKeys)[keyof typeof queryKeys]

// Helper functions for invalidation patterns
export const invalidationPatterns = {
  // Invalidate all lists
  invalidateAllLists: () => [queryKeys.lists],

  // Invalidate specific list and its tasks
  invalidateList: (listId: string) => [
    queryKeys.list(listId),
    queryKeys.listTasks(listId),
    queryKeys.tasksByList(listId),
  ],

  // Invalidate all tasks
  invalidateAllTasks: () => [queryKeys.tasks],

  // Invalidate specific task and related queries
  invalidateTask: (taskId: string, listId?: string) => {
    const keys: (readonly string[])[] = [queryKeys.task(taskId)]
    if (listId) {
      keys.push(queryKeys.listTasks(listId))
      keys.push(queryKeys.tasksByList(listId))
    }
    return keys
  },

  // Invalidate analytics
  invalidateAnalytics: () => [queryKeys.analytics],

  // Invalidate dashboard
  invalidateDashboard: () => [queryKeys.dashboard],

  // Invalidate search results
  invalidateSearch: () => [['search']],

  // Invalidate filtered queries
  invalidateFiltered: () => [
    ['tasks', 'filtered'],
    ['lists', 'filtered'],
  ],
} as const
