/**
 * Service for advanced task querying and filtering operations
 */

import { ITaskRepository } from '../repositories/interfaces/ITaskRepository';
import { RepositoryFactory } from '../repositories/repositoryFactory';
import { Task, TaskQuery, TaskPriority, TaskSortField } from '../types/task.types';
import { PaginationResponse } from '../types/api.types';
import {
  getTasksDueWithin,
  getOverdueTasks,
  sortTasksByDeadline,
  groupTasksByDeadlineStatus
} from './dateUtils';

export interface QueryResult<T> {
  data: T[];
  pagination?: PaginationResponse;
  total: number;
}

/**
 * Service for handling complex task queries and aggregations
 */
export class QueryService {
  private taskRepository: ITaskRepository;

  constructor() {
    this.taskRepository = RepositoryFactory.getTaskRepository();
  }

  /**
   * Find tasks due this week across all lists for a specific user
   * @param userId - The user ID
   * @returns Promise that resolves to tasks due this week
   */
  async getTasksDueThisWeek(userId: string): Promise<Task[]> {
    return await this.taskRepository.findDueThisWeek(userId);
  }

  /**
   * Find tasks with advanced filtering and pagination for a specific user
   * @param query - Query parameters
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to query result with pagination
   */
  async findTasks(query: TaskQuery, userId: string, listId?: string): Promise<QueryResult<Task>> {
    // Get total count for pagination (before applying limit/offset)
    const allMatchingTasks = await this.taskRepository.findByQuery(
      { ...query, page: 1, limit: Number.MAX_SAFE_INTEGER },
      userId,
      listId
    );
    const total = allMatchingTasks.length;

    // Get paginated results
    const tasks = await this.taskRepository.findByQuery(query, userId, listId);

    // Calculate pagination metadata
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: tasks,
      total,
      pagination: {
        page,
        limit,
        totalPages,
        hasNext: hasNextPage,
        hasPrev: hasPreviousPage,
        total
      }
    };
  }

  /**
   * Get overdue tasks for a specific user
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to overdue tasks
   */
  async getOverdueTasks(userId: string, listId?: string): Promise<Task[]> {
    const query: TaskQuery = {
      completed: false,
      dueBefore: new Date().toISOString()
    };

    const result = await this.taskRepository.findByQuery(query, userId, listId);
    return result;
  }

  /**
   * Get tasks by priority for a specific user
   * @param priority - Task priority to filter by
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to tasks with specified priority
   */
  async getTasksByPriority(
    priority: TaskPriority,
    userId: string,
    listId?: string
  ): Promise<Task[]> {
    const query: TaskQuery = {
      priority,
      sortBy: TaskSortField.CREATED_AT,
      order: 'desc'
    };

    return await this.taskRepository.findByQuery(query, userId, listId);
  }

  /**
   * Get completed tasks within a date range for a specific user
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to completed tasks in range
   */
  async getCompletedTasksInRange(
    startDate: string,
    endDate: string,
    userId: string,
    listId?: string
  ): Promise<Task[]> {
    const query: TaskQuery = {
      completed: true,
      dueAfter: startDate,
      dueBefore: endDate,
      sortBy: TaskSortField.UPDATED_AT,
      order: 'desc'
    };

    const tasks = await this.taskRepository.findByQuery(query, userId, listId);

    // Filter by completion date since we can't query by completedAt directly
    return tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = task.completedAt.toISOString();
      return completedDate >= startDate && completedDate <= endDate;
    });
  }

  /**
   * Get task statistics for a specific user
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to task statistics
   */
  async getTaskStatistics(userId: string, listId?: string) {
    const allTasks = await this.taskRepository.findByQuery(
      { page: 1, limit: Number.MAX_SAFE_INTEGER },
      userId,
      listId
    );

    const completed = allTasks.filter(task => task.completed);
    const pending = allTasks.filter(task => !task.completed);
    const overdue = allTasks.filter(
      task => task.deadline && task.deadline < new Date() && !task.completed
    );

    const priorityStats = {
      low: allTasks.filter(task => task.priority === TaskPriority.LOW).length,
      medium: allTasks.filter(task => task.priority === TaskPriority.MEDIUM).length,
      high: allTasks.filter(task => task.priority === TaskPriority.HIGH).length,
      urgent: allTasks.filter(task => task.priority === TaskPriority.URGENT).length
    };

    return {
      total: allTasks.length,
      completed: completed.length,
      pending: pending.length,
      overdue: overdue.length,
      completionRate: allTasks.length > 0 ? (completed.length / allTasks.length) * 100 : 0,
      priorityDistribution: priorityStats,
      ...(listId && { listId })
    };
  }

  /**
   * Search tasks by title or description for a specific user
   * @param searchTerm - Term to search for
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to matching tasks
   */
  async searchTasks(searchTerm: string, userId: string, listId?: string): Promise<Task[]> {
    // Get all tasks first, then filter by search term
    const allTasks = await this.taskRepository.findByQuery(
      { page: 1, limit: Number.MAX_SAFE_INTEGER },
      userId,
      listId
    );

    const searchLower = searchTerm.toLowerCase();
    return allTasks.filter(
      task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Get tasks grouped by completion status for a specific user
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to grouped tasks
   */
  async getTasksGroupedByStatus(userId: string, listId?: string) {
    const allTasks = await this.taskRepository.findByQuery(
      { page: 1, limit: Number.MAX_SAFE_INTEGER },
      userId,
      listId
    );

    const now = new Date();

    return {
      completed: allTasks.filter(task => task.completed),
      pending: allTasks.filter(task => !task.completed && (!task.deadline || task.deadline >= now)),
      overdue: allTasks.filter(task => !task.completed && task.deadline && task.deadline < now),
      urgent: allTasks.filter(
        task =>
          !task.completed &&
          task.deadline &&
          task.deadline >= now &&
          task.deadline <= new Date(now.getTime() + 24 * 60 * 60 * 1000)
      )
    };
  }

  /**
   * Get productivity insights for a specific user
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to productivity insights
   */
  async getProductivityInsights(userId: string, listId?: string) {
    const allTasks = await this.taskRepository.findByQuery(
      { page: 1, limit: Number.MAX_SAFE_INTEGER },
      userId,
      listId
    );

    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completedThisWeek = allTasks.filter(
      task => task.completed && task.completedAt && task.completedAt >= thisWeek
    );

    const completedThisMonth = allTasks.filter(
      task => task.completed && task.completedAt && task.completedAt >= thisMonth
    );

    const createdThisWeek = allTasks.filter(task => task.createdAt >= thisWeek);
    const createdThisMonth = allTasks.filter(task => task.createdAt >= thisMonth);

    return {
      completedThisWeek: completedThisWeek.length,
      completedThisMonth: completedThisMonth.length,
      createdThisWeek: createdThisWeek.length,
      createdThisMonth: createdThisMonth.length,
      averageCompletionTime: this.calculateAverageCompletionTime(
        allTasks.filter(task => task.completed)
      ),
      productivity: {
        daily: this.calculateDailyProductivity(allTasks),
        weekly: this.calculateWeeklyProductivity(allTasks),
        monthly: this.calculateMonthlyProductivity(allTasks)
      }
    };
  }

  /**
   * Calculate average completion time for tasks
   * @private
   */
  private calculateAverageCompletionTime(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      if (task.completedAt) {
        return sum + (task.completedAt.getTime() - task.createdAt.getTime());
      }
      return sum;
    }, 0);

    return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)); // Days
  }

  /**
   * Calculate daily productivity metrics
   * @private
   */
  private calculateDailyProductivity(tasks: Task[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTasks = tasks.filter(task => task.createdAt >= today);
    const completedToday = todayTasks.filter(task => task.completed);

    return {
      created: todayTasks.length,
      completed: completedToday.length,
      rate: todayTasks.length > 0 ? (completedToday.length / todayTasks.length) * 100 : 0
    };
  }

  /**
   * Calculate weekly productivity metrics
   * @private
   */
  private calculateWeeklyProductivity(tasks: Task[]) {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const weekTasks = tasks.filter(task => task.createdAt >= thisWeek);
    const completedThisWeek = weekTasks.filter(task => task.completed);

    return {
      created: weekTasks.length,
      completed: completedThisWeek.length,
      rate: weekTasks.length > 0 ? (completedThisWeek.length / weekTasks.length) * 100 : 0
    };
  }

  /**
   * Calculate monthly productivity metrics
   * @private
   */
  private calculateMonthlyProductivity(tasks: Task[]) {
    const thisMonth = new Date();
    thisMonth.setDate(thisMonth.getDate() - 30);

    const monthTasks = tasks.filter(task => task.createdAt >= thisMonth);
    const completedThisMonth = monthTasks.filter(task => task.completed);

    return {
      created: monthTasks.length,
      completed: completedThisMonth.length,
      rate: monthTasks.length > 0 ? (completedThisMonth.length / monthTasks.length) * 100 : 0
    };
  }
}
