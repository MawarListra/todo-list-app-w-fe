/**
 * Service layer for Task operations
 * Handles business logic, validation, and coordination between controllers and repositories
 */

import { ITaskRepository } from '../repositories/interfaces/ITaskRepository';
import { IListRepository } from '../repositories/interfaces/IListRepository';
import { RepositoryFactory } from '../repositories/repositoryFactory';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskQuery,
  TaskResponse,
  TaskPriority
} from '../types/task.types';
import { TaskValidator } from './validators/taskValidator';
import {
  TaskNotFoundError,
  TaskValidationError,
  ListNotFoundError,
  TaskListMismatchError
} from '../exceptions/customExceptions';
import { isOverdue, isUrgent, formatDateForDisplay } from './dateUtils';

/**
 * Service for managing tasks and their associated business logic
 */
export class TaskService {
  private taskRepository: ITaskRepository;
  private listRepository: IListRepository;

  constructor() {
    this.taskRepository = RepositoryFactory.getTaskRepository();
    this.listRepository = RepositoryFactory.getListRepository();
  }

  /**
   * Create a new task in a list
   * @param listId - ID of the list to create the task in
   * @param userId - ID of the user creating the task
   * @param createData - Data for creating the task
   * @returns Promise that resolves to the created task response
   * @throws {ListNotFoundError} If the list doesn't exist
   * @throws {TaskValidationError} If validation fails
   */
  async createTask(
    listId: string,
    userId: string,
    createData: CreateTaskRequest
  ): Promise<TaskResponse> {
    // Verify the list exists and belongs to the user
    const listExists = await this.listRepository.exists(listId, userId);
    if (!listExists) {
      throw new ListNotFoundError(listId);
    }

    // Get existing task titles in the list for uniqueness validation
    const existingTasks = await this.taskRepository.findByListId(listId, userId);
    const existingTitles = existingTasks.map(task => task.title);

    // Validate the request
    const validatedData = TaskValidator.validateCreateRequest(createData);

    // Create the task
    const task = await this.taskRepository.create(listId, userId, validatedData);

    // Return formatted response
    return this.formatTaskResponse(task);
  }

  /**
   * Get a task by ID for a specific user
   * @param taskId - The task ID
   * @param userId - The user ID
   * @returns Promise that resolves to the task response
   * @throws {TaskNotFoundError} If task is not found
   */
  async getTaskById(taskId: string, userId: string): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(taskId, userId);

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    return this.formatTaskResponse(task);
  }

  /**
   * Get all tasks in a list for a specific user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to an array of task responses
   * @throws {ListNotFoundError} If the list doesn't exist
   */
  async getTasksByListId(listId: string, userId: string): Promise<TaskResponse[]> {
    // Verify the list exists and belongs to the user
    const listExists = await this.listRepository.exists(listId, userId);
    if (!listExists) {
      throw new ListNotFoundError(listId);
    }

    const tasks = await this.taskRepository.findByListId(listId, userId);
    return tasks.map(task => this.formatTaskResponse(task));
  }

  /**
   * Update a task for a specific user
   * @param taskId - The task ID
   * @param userId - The user ID
   * @param updateData - Data for updating the task
   * @returns Promise that resolves to the updated task response
   * @throws {TaskNotFoundError} If task is not found
   * @throws {TaskValidationError} If validation fails
   */
  async updateTask(
    taskId: string,
    userId: string,
    updateData: UpdateTaskRequest
  ): Promise<TaskResponse> {
    // Check if task exists and belongs to user
    const existingTask = await this.taskRepository.findById(taskId, userId);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Get existing task titles in the list for uniqueness validation (excluding current task)
    const allTasksInList = await this.taskRepository.findByListId(existingTask.listId, userId);
    const existingTitles = allTasksInList
      .filter(task => task.id !== taskId)
      .map(task => task.title);

    // Validate the update request
    const validatedData = TaskValidator.validateUpdateRequest(updateData);

    // Update the task
    const updatedTask = await this.taskRepository.update(taskId, userId, validatedData);

    if (!updatedTask) {
      throw new TaskNotFoundError(taskId);
    }

    return this.formatTaskResponse(updatedTask);
  }

  /**
   * Update task completion status for a specific user
   * @param taskId - The task ID
   * @param userId - The user ID
   * @param completed - Whether the task is completed
   * @returns Promise that resolves to the updated task response
   * @throws {TaskNotFoundError} If task is not found
   */
  async updateTaskCompletion(
    taskId: string,
    userId: string,
    completed: boolean
  ): Promise<TaskResponse> {
    // Check if task exists and belongs to user
    const existingTask = await this.taskRepository.findById(taskId, userId);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Update task completion
    const updatedTask = await this.taskRepository.updateCompletion(taskId, userId, completed);

    if (!updatedTask) {
      throw new TaskNotFoundError(taskId);
    }

    return this.formatTaskResponse(updatedTask);
  }

  /**
   * Update task deadline for a specific user
   * @param taskId - The task ID
   * @param userId - The user ID
   * @param deadline - New deadline (ISO string)
   * @returns Promise that resolves to the updated task response
   * @throws {TaskNotFoundError} If task is not found
   * @throws {TaskValidationError} If deadline validation fails
   */
  async updateTaskDeadline(
    taskId: string,
    userId: string,
    deadline: string
  ): Promise<TaskResponse> {
    // Check if task exists and belongs to user
    const existingTask = await this.taskRepository.findById(taskId, userId);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Validate deadline
    const validatedDeadline = TaskValidator.validateDeadline(deadline);

    // Update task deadline
    const updatedTask = await this.taskRepository.updateDeadline(
      taskId,
      userId,
      new Date(deadline)
    );

    if (!updatedTask) {
      throw new TaskNotFoundError(taskId);
    }

    return this.formatTaskResponse(updatedTask);
  }

  /**
   * Delete a task for a specific user
   * @param taskId - The task ID
   * @param userId - The user ID
   * @returns Promise that resolves to true if deleted successfully
   * @throws {TaskNotFoundError} If task is not found
   */
  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    // Check if task exists and belongs to user
    const existingTask = await this.taskRepository.findById(taskId, userId);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Delete the task
    const deleted = await this.taskRepository.delete(taskId, userId);

    return deleted;
  }

  /**
   * Search/query tasks for a specific user
   * @param query - Query parameters for filtering and sorting
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to an array of task responses
   */
  async queryTasks(query: TaskQuery, userId: string, listId?: string): Promise<TaskResponse[]> {
    // If listId is provided, verify it exists and belongs to the user
    if (listId) {
      const listExists = await this.listRepository.exists(listId, userId);
      if (!listExists) {
        throw new ListNotFoundError(listId);
      }
    }

    // Validate the query
    const validatedQuery = TaskValidator.validateTaskQuery(query);

    // Get tasks based on query
    const tasks = await this.taskRepository.findByQuery(validatedQuery, userId, listId);

    return tasks.map(task => this.formatTaskResponse(task));
  }

  /**
   * Get tasks due this week for a specific user
   * @param userId - The user ID
   * @returns Promise that resolves to an array of task responses
   */
  async getTasksDueThisWeek(userId: string): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.findDueThisWeek(userId);
    return tasks.map(task => this.formatTaskResponse(task));
  }

  /**
   * Check if a task exists for a specific user
   * @param taskId - The task ID
   * @param userId - The user ID
   * @returns Promise that resolves to true if task exists
   */
  async taskExists(taskId: string, userId: string): Promise<boolean> {
    return await this.taskRepository.exists(taskId, userId);
  }

  /**
   * Get task statistics for a specific task and user
   * @param taskId - The task ID
   * @param userId - The user ID
   * @returns Promise that resolves to task statistics
   * @throws {TaskNotFoundError} If task is not found
   */
  async getTaskStatistics(taskId: string, userId: string) {
    const task = await this.taskRepository.findById(taskId, userId);
    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    const isTaskOverdue = task.deadline ? isOverdue(task.deadline) : false;
    const isTaskUrgent = task.deadline ? isUrgent(task.deadline) : false;
    const daysUntilDeadline = task.deadline
      ? Math.ceil((task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      taskId: task.id,
      title: task.title,
      completed: task.completed,
      isOverdue: isTaskOverdue,
      isUrgent: isTaskUrgent,
      daysUntilDeadline,
      priority: task.priority,
      createdDaysAgo: Math.floor(
        (new Date().getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    };
  }

  /**
   * Get overdue tasks for a specific user
   * @param userId - The user ID
   * @returns Promise that resolves to an array of overdue task responses
   */
  async getOverdueTasks(userId: string): Promise<TaskResponse[]> {
    const now = new Date();
    const query: TaskQuery = {
      completed: false,
      dueBefore: now.toISOString()
    };

    return this.queryTasks(query, userId);
  }

  /**
   * Get urgent tasks (due within 24 hours) for a specific user
   * @param userId - The user ID
   * @returns Promise that resolves to an array of urgent task responses
   */
  async getUrgentTasks(userId: string): Promise<TaskResponse[]> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const query: TaskQuery = {
      completed: false,
      dueAfter: now.toISOString(),
      dueBefore: tomorrow.toISOString()
    };

    return this.queryTasks(query, userId);
  }

  /**
   * Get high priority tasks for a specific user
   * @param userId - The user ID
   * @returns Promise that resolves to an array of high priority task responses
   */
  async getHighPriorityTasks(userId: string): Promise<TaskResponse[]> {
    const query: TaskQuery = {
      priority: TaskPriority.HIGH,
      completed: false
    };

    return this.queryTasks(query, userId);
  }

  /**
   * Get task analytics for a list for a specific user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to task analytics
   * @throws {ListNotFoundError} If the list doesn't exist
   */
  async getListTaskAnalytics(listId: string, userId: string) {
    // Verify the list exists and belongs to the user
    const listExists = await this.listRepository.exists(listId, userId);
    if (!listExists) {
      throw new ListNotFoundError(listId);
    }

    const tasks = await this.taskRepository.findByListId(listId, userId);

    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    const overdueTasks = tasks.filter(
      task => task.deadline && task.deadline < new Date() && !task.completed
    );
    const urgentTasks = tasks.filter(
      task => task.deadline && isUrgent(task.deadline) && !task.completed
    );

    const priorityDistribution = {
      low: tasks.filter(task => task.priority === TaskPriority.LOW).length,
      medium: tasks.filter(task => task.priority === TaskPriority.MEDIUM).length,
      high: tasks.filter(task => task.priority === TaskPriority.HIGH).length,
      urgent: tasks.filter(task => task.priority === TaskPriority.URGENT).length
    };

    return {
      listId,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      urgentTasks: urgentTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      priorityDistribution
    };
  }

  /**
   * Format a Task entity to TaskResponse
   * @private
   */
  private formatTaskResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      listId: task.listId,
      title: task.title,
      ...(task.description !== undefined && { description: task.description }),
      completed: task.completed,
      ...(task.deadline && { deadline: task.deadline.toISOString() }),
      priority: task.priority,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      ...(task.completedAt && { completedAt: task.completedAt.toISOString() })
    };
  }
}
