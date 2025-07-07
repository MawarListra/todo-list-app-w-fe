import { api } from './httpClient'
import { Task } from '../types/task.types'

export interface TaskStatistics {
  total: number
  completed: number
  pending: number
  overdue: number
  dueToday: number
  dueThisWeek: number
  completionRate: number
  averageCompletionTime: number
  priorityBreakdown: {
    high: number
    medium: number
    low: number
  }
}

export interface ProductivityInsights {
  tasksCompletedToday: number
  tasksCompletedThisWeek: number
  tasksCompletedThisMonth: number
  averageTasksPerDay: number
  bestDay: {
    date: Date
    tasksCompleted: number
  }
  productivityTrend: {
    date: Date
    tasksCompleted: number
    tasksCreated: number
  }[]
  completionTimeByPriority: {
    high: number
    medium: number
    low: number
  }
}

export interface RecentActivity {
  id: string
  type:
    | 'task_created'
    | 'task_completed'
    | 'task_updated'
    | 'task_deleted'
    | 'list_created'
    | 'list_updated'
    | 'list_deleted'
  taskId?: string
  listId?: string
  taskTitle?: string
  listName?: string
  timestamp: Date
  description: string
}

export interface DashboardData {
  stats: TaskStatistics
  dueThisWeek: Task[]
  overdue: Task[]
  recentActivity: RecentActivity[]
  productivity: ProductivityInsights
}

export const analyticsService = {
  /**
   * Get comprehensive task statistics
   */
  async getTaskStatistics(): Promise<TaskStatistics> {
    const response = await api.get<TaskStatistics>('/analytics/task-statistics')
    return response
  },

  /**
   * Get productivity insights
   */
  async getProductivityInsights(): Promise<ProductivityInsights> {
    const response = await api.get<ProductivityInsights>(
      '/analytics/productivity-insights'
    )
    return response
  },

  /**
   * Get tasks due this week
   */
  async getDueThisWeek(): Promise<Task[]> {
    const response = await api.get<Task[]>('/analytics/due-this-week')
    return response
  },

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/analytics/overdue-tasks')
    return response
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 20): Promise<RecentActivity[]> {
    const response = await api.get<RecentActivity[]>(
      `/analytics/recent-activity?limit=${limit}`
    )
    return response
  },

  /**
   * Get dashboard data (aggregated)
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/analytics/dashboard')
    return response
  },

  /**
   * Get completion rate by date range
   */
  async getCompletionRateByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<
    {
      date: Date
      completionRate: number
      tasksCompleted: number
      totalTasks: number
    }[]
  > {
    const params = new URLSearchParams()
    params.append('startDate', startDate.toISOString())
    params.append('endDate', endDate.toISOString())

    const response = await api.get<
      {
        date: Date
        completionRate: number
        tasksCompleted: number
        totalTasks: number
      }[]
    >(`/analytics/completion-rate?${params.toString()}`)
    return response
  },

  /**
   * Get task creation vs completion trend
   */
  async getTaskTrends(days = 30): Promise<
    {
      date: Date
      tasksCreated: number
      tasksCompleted: number
      netTasks: number
    }[]
  > {
    const response = await api.get<
      {
        date: Date
        tasksCreated: number
        tasksCompleted: number
        netTasks: number
      }[]
    >(`/analytics/task-trends?days=${days}`)
    return response
  },

  /**
   * Get productivity by time of day
   */
  async getProductivityByTimeOfDay(): Promise<
    {
      hour: number
      tasksCompleted: number
      averageCompletionTime: number
    }[]
  > {
    const response = await api.get<
      {
        hour: number
        tasksCompleted: number
        averageCompletionTime: number
      }[]
    >('/analytics/productivity-by-time')
    return response
  },

  /**
   * Get list performance metrics
   */
  async getListPerformanceMetrics(): Promise<
    {
      listId: string
      listName: string
      totalTasks: number
      completedTasks: number
      completionRate: number
      averageTaskAge: number
      overdueCount: number
    }[]
  > {
    const response = await api.get<
      {
        listId: string
        listName: string
        totalTasks: number
        completedTasks: number
        completionRate: number
        averageTaskAge: number
        overdueCount: number
      }[]
    >('/analytics/list-performance')
    return response
  },

  /**
   * Get task completion forecast
   */
  async getCompletionForecast(days = 7): Promise<
    {
      date: Date
      estimatedCompletions: number
      confidence: number
    }[]
  > {
    const response = await api.get<
      {
        date: Date
        estimatedCompletions: number
        confidence: number
      }[]
    >(`/analytics/completion-forecast?days=${days}`)
    return response
  },
}
