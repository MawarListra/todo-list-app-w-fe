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
   * Find tasks due this week across all lists
   * @returns Promise that resolves to tasks due this week
   */
  async getTasksDueThisWeek(): Promise<Task[]> {
    return await this.taskRepository.findDueThisWeek();
  }

  /**
   * Find tasks with advanced filtering and pagination
   * @param query - Query parameters
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to query result with pagination
   */
  async findTasks(query: TaskQuery, listId?: string): Promise<QueryResult<Task>> {
    // Get total count for pagination (before applying limit/offset)
    const allMatchingTasks = await this.taskRepository.findByQuery(
      { ...query, page: 1, limit: Number.MAX_SAFE_INTEGER },
      listId
    );
    const total = allMatchingTasks.length;

    // Get paginated results
    const tasks = await this.taskRepository.findByQuery(query, listId);

    // Calculate pagination metadata
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationResponse = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return {
      data: tasks,
      pagination,
      total
    };
  }

  /**
   * Get overdue tasks across all lists or a specific list
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to overdue tasks
   */
  async getOverdueTasks(listId?: string): Promise<Task[]> {
    const query: TaskQuery = {
      completed: false,
      dueBefore: new Date().toISOString(),
      sortBy: TaskSortField.DEADLINE,
      order: 'asc'
    };

    const result = await this.taskRepository.findByQuery(query, listId);
    return result;
  }

  /**
   * Get tasks by priority level
   * @param priority - Priority level to filter by
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to tasks with specified priority
   */
  async getTasksByPriority(priority: TaskPriority, listId?: string): Promise<Task[]> {
    const query: TaskQuery = {
      priority,
      sortBy: TaskSortField.CREATED_AT,
      order: 'desc'
    };

    return await this.taskRepository.findByQuery(query, listId);
  }

  /**
   * Get completed tasks within a date range
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to completed tasks in date range
   */
  async getCompletedTasksInRange(
    startDate: string,
    endDate: string,
    listId?: string
  ): Promise<Task[]> {
    // Note: This is a simplified implementation
    // For a full implementation, we'd need to add completedAt filtering to the repository
    const query: TaskQuery = {
      completed: true,
      sortBy: TaskSortField.UPDATED_AT,
      order: 'desc'
    };

    const tasks = await this.taskRepository.findByQuery(query, listId);

    // Filter by completion date (simplified - using updatedAt as proxy for completedAt)
    const start = new Date(startDate);
    const end = new Date(endDate);

    return tasks.filter(task => {
      const completionDate = task.completedAt ? new Date(task.completedAt) : task.updatedAt;
      return completionDate >= start && completionDate <= end;
    });
  }

  /**
   * Get task statistics for a list or all lists
   * @param listId - Optional list ID to get stats for
   * @returns Promise that resolves to task statistics
   */
  async getTaskStatistics(listId?: string) {
    const allTasks = await this.taskRepository.findByQuery(
      { page: 1, limit: Number.MAX_SAFE_INTEGER },
      listId
    );

    const now = new Date();
    const completed = allTasks.filter(task => task.completed);
    const pending = allTasks.filter(task => !task.completed);
    const overdue = allTasks.filter(
      task => task.deadline && task.deadline < now && !task.completed
    );
    const dueToday = allTasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      const deadline = new Date(task.deadline);
      const today = new Date();
      return (
        deadline.getFullYear() === today.getFullYear() &&
        deadline.getMonth() === today.getMonth() &&
        deadline.getDate() === today.getDate()
      );
    });

    const priorityBreakdown = {
      [TaskPriority.LOW]: allTasks.filter(t => t.priority === TaskPriority.LOW).length,
      [TaskPriority.MEDIUM]: allTasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
      [TaskPriority.HIGH]: allTasks.filter(t => t.priority === TaskPriority.HIGH).length,
      [TaskPriority.URGENT]: allTasks.filter(t => t.priority === TaskPriority.URGENT).length
    };

    return {
      total: allTasks.length,
      completed: completed.length,
      pending: pending.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      completionRate: allTasks.length > 0 ? (completed.length / allTasks.length) * 100 : 0,
      priorityBreakdown,
      averageCompletionTime: this.calculateAverageCompletionTime(completed)
    };
  }

  /**
   * Search tasks by title or description
   * @param searchTerm - Term to search for
   * @param listId - Optional list ID to search within
   * @returns Promise that resolves to matching tasks
   */
  async searchTasks(searchTerm: string, listId?: string): Promise<Task[]> {
    // Get all tasks (in a real implementation, this would be optimized with a search index)
    const allTasks = await this.taskRepository.findByQuery(
      { page: 1, limit: Number.MAX_SAFE_INTEGER },
      listId
    );

    const searchTermLower = searchTerm.toLowerCase();

    return allTasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(searchTermLower);
      const descriptionMatch = task.description?.toLowerCase().includes(searchTermLower);
      return titleMatch || descriptionMatch;
    });
  }

  /**
   * Get tasks grouped by status and deadline
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to grouped tasks
   */
  async getTasksGroupedByStatus(listId?: string) {
    const allTasks = await this.taskRepository.findByQuery(
      { page: 1, limit: Number.MAX_SAFE_INTEGER },
      listId
    );

    const deadlineGroups = groupTasksByDeadlineStatus(allTasks);

    return {
      byCompletion: {
        completed: allTasks.filter(task => task.completed),
        pending: allTasks.filter(task => !task.completed)
      },
      byDeadline: deadlineGroups,
      byPriority: {
        [TaskPriority.URGENT]: allTasks.filter(t => t.priority === TaskPriority.URGENT),
        [TaskPriority.HIGH]: allTasks.filter(t => t.priority === TaskPriority.HIGH),
        [TaskPriority.MEDIUM]: allTasks.filter(t => t.priority === TaskPriority.MEDIUM),
        [TaskPriority.LOW]: allTasks.filter(t => t.priority === TaskPriority.LOW)
      }
    };
  }

  /**
   * Get productivity insights
   * @param listId - Optional list ID to analyze
   * @returns Promise that resolves to productivity insights
   */
  async getProductivityInsights(listId?: string) {
    const allTasks = await this.taskRepository.findByQuery(
      { page: 1, limit: Number.MAX_SAFE_INTEGER },
      listId
    );

    const now = new Date();
    const thisWeek = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thisMonth = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    const tasksThisWeek = allTasks.filter(task => task.createdAt.getTime() >= thisWeek);

    const completedThisWeek = allTasks.filter(
      task => task.completed && task.updatedAt.getTime() >= thisWeek
    );

    const completedThisMonth = allTasks.filter(
      task => task.completed && task.updatedAt.getTime() >= thisMonth
    );

    return {
      tasksCreatedThisWeek: tasksThisWeek.length,
      tasksCompletedThisWeek: completedThisWeek.length,
      tasksCompletedThisMonth: completedThisMonth.length,
      weeklyCompletionRate:
        tasksThisWeek.length > 0 ? (completedThisWeek.length / tasksThisWeek.length) * 100 : 0,
      averageTasksPerDay: tasksThisWeek.length / 7,
      mostProductiveDay: this.getMostProductiveDay(completedThisWeek),
      taskCompletionTrend: this.getCompletionTrend(allTasks)
    };
  }

  /**
   * Calculate average completion time for completed tasks
   * @private
   */
  private calculateAverageCompletionTime(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime = task.completedAt
        ? new Date(task.completedAt).getTime() - task.createdAt.getTime()
        : task.updatedAt.getTime() - task.createdAt.getTime();
      return sum + completionTime;
    }, 0);

    // Return average in hours
    return totalTime / completedTasks.length / (1000 * 60 * 60);
  }

  /**
   * Get the most productive day of the week
   * @private
   */
  private getMostProductiveDay(completedTasks: Task[]): string {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = new Array(7).fill(0);

    completedTasks.forEach(task => {
      const completionDate = task.completedAt ? new Date(task.completedAt) : task.updatedAt;
      dayCounts[completionDate.getDay()]++;
    });

    const maxCount = Math.max(...dayCounts);
    const mostProductiveDayIndex = dayCounts.indexOf(maxCount);

    return dayNames[mostProductiveDayIndex] || 'Sunday';
  }

  /**
   * Get task completion trend over time
   * @private
   */
  private getCompletionTrend(allTasks: Task[]): 'improving' | 'declining' | 'stable' {
    if (allTasks.length < 4) return 'stable';

    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const completedLastWeek = allTasks.filter(
      task => task.completed && task.updatedAt >= twoWeeksAgo && task.updatedAt < oneWeekAgo
    ).length;

    const completedThisWeek = allTasks.filter(
      task => task.completed && task.updatedAt >= oneWeekAgo
    ).length;

    if (completedThisWeek > completedLastWeek) return 'improving';
    if (completedThisWeek < completedLastWeek) return 'declining';
    return 'stable';
  }
}
