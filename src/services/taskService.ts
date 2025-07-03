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
   * @param createData - Data for creating the task
   * @returns Promise that resolves to the created task response
   * @throws {ListNotFoundError} If the list doesn't exist
   * @throws {TaskValidationError} If validation fails
   */
  async createTask(listId: string, createData: CreateTaskRequest): Promise<TaskResponse> {
    // Verify the list exists
    const listExists = await this.listRepository.exists(listId);
    if (!listExists) {
      throw new ListNotFoundError(listId);
    }

    // Get existing task titles in the list for uniqueness validation
    const existingTasks = await this.taskRepository.findByListId(listId);
    const existingTitles = existingTasks.map(task => task.title);

    // Validate the request
    const validatedData = TaskValidator.validateCreateRequest(createData);

    // Create the task
    const task = await this.taskRepository.create(listId, validatedData);

    // Return formatted response
    return this.formatTaskResponse(task);
  }

  /**
   * Get a task by ID
   * @param taskId - The task ID
   * @returns Promise that resolves to the task response
   * @throws {TaskNotFoundError} If task is not found
   */
  async getTaskById(taskId: string): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    return this.formatTaskResponse(task);
  }

  /**
   * Get all tasks for a specific list
   * @param listId - The list ID
   * @returns Promise that resolves to an array of task responses
   * @throws {ListNotFoundError} If list is not found
   */
  async getTasksByListId(listId: string): Promise<TaskResponse[]> {
    // Verify the list exists
    const listExists = await this.listRepository.exists(listId);
    if (!listExists) {
      throw new ListNotFoundError(listId);
    }

    const tasks = await this.taskRepository.findByListId(listId);
    return tasks.map(task => this.formatTaskResponse(task));
  }

  /**
   * Update a task
   * @param taskId - The task ID
   * @param updateData - Data for updating the task
   * @returns Promise that resolves to the updated task response
   * @throws {TaskNotFoundError} If task is not found
   * @throws {TaskValidationError} If validation fails
   */
  async updateTask(taskId: string, updateData: UpdateTaskRequest): Promise<TaskResponse> {
    // Check if task exists
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Get existing task titles in the list for uniqueness validation (excluding current task)
    const allTasksInList = await this.taskRepository.findByListId(existingTask.listId);
    const existingTitles = allTasksInList
      .filter(task => task.id !== taskId)
      .map(task => task.title);

    // Validate the update request
    const validatedData = TaskValidator.validateUpdateRequest(updateData);

    // Update the task
    const updatedTask = await this.taskRepository.update(taskId, validatedData);

    if (!updatedTask) {
      throw new TaskNotFoundError(taskId);
    }

    return this.formatTaskResponse(updatedTask);
  }

  /**
   * Update task completion status
   * @param taskId - The task ID
   * @param completed - Whether the task is completed
   * @returns Promise that resolves to the updated task response
   * @throws {TaskNotFoundError} If task is not found
   */
  async updateTaskCompletion(taskId: string, completed: boolean): Promise<TaskResponse> {
    // Check if task exists
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Update completion status
    const updatedTask = await this.taskRepository.updateCompletion(taskId, completed);

    if (!updatedTask) {
      throw new TaskNotFoundError(taskId);
    }

    return this.formatTaskResponse(updatedTask);
  }

  /**
   * Update task deadline
   * @param taskId - The task ID
   * @param deadline - New deadline (ISO string)
   * @returns Promise that resolves to the updated task response
   * @throws {TaskNotFoundError} If task is not found
   * @throws {TaskValidationError} If deadline is invalid
   */
  async updateTaskDeadline(taskId: string, deadline: string): Promise<TaskResponse> {
    // Check if task exists
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Validate the deadline
    TaskValidator.validateDeadline(deadline);

    // Update deadline
    const updatedTask = await this.taskRepository.updateDeadline(taskId, new Date(deadline));

    if (!updatedTask) {
      throw new TaskNotFoundError(taskId);
    }

    return this.formatTaskResponse(updatedTask);
  }

  /**
   * Delete a task
   * @param taskId - The task ID
   * @returns Promise that resolves to true if deleted successfully
   * @throws {TaskNotFoundError} If task is not found
   */
  async deleteTask(taskId: string): Promise<boolean> {
    // Check if task exists
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Delete the task
    const deleted = await this.taskRepository.delete(taskId);

    return deleted;
  }

  /**
   * Find tasks with query parameters
   * @param query - Query parameters for filtering and sorting
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to filtered and sorted tasks
   * @throws {ListNotFoundError} If specified list is not found
   */
  async findTasks(query: TaskQuery, listId?: string): Promise<TaskResponse[]> {
    // If listId is specified, verify it exists
    if (listId) {
      const listExists = await this.listRepository.exists(listId);
      if (!listExists) {
        throw new ListNotFoundError(listId);
      }
    }

    // Validate query parameters
    const validatedQuery = TaskValidator.validateTaskQuery(query);

    // Find tasks
    const tasks = await this.taskRepository.findByQuery(validatedQuery, listId);

    return tasks.map(task => this.formatTaskResponse(task));
  }

  /**
   * Get tasks due this week
   * @returns Promise that resolves to tasks due this week
   */
  async getTasksDueThisWeek(): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.findDueThisWeek();
    return tasks.map(task => this.formatTaskResponse(task));
  }

  /**
   * Check if a task exists
   * @param taskId - The task ID
   * @returns Promise that resolves to true if task exists
   */
  async taskExists(taskId: string): Promise<boolean> {
    return await this.taskRepository.exists(taskId);
  }

  /**
   * Verify that a task belongs to a specific list
   * @param taskId - The task ID
   * @param listId - The list ID
   * @throws {TaskNotFoundError} If task is not found
   * @throws {TaskListMismatchError} If task doesn't belong to the list
   */
  async verifyTaskInList(taskId: string, listId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    if (task.listId !== listId) {
      throw new TaskListMismatchError(taskId, listId);
    }
  }

  /**
   * Get task statistics for a specific task
   * @param taskId - The task ID
   * @returns Promise that resolves to task statistics
   * @throws {TaskNotFoundError} If task is not found
   */
  async getTaskStatistics(taskId: string) {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    const createdDaysAgo = Math.floor(
      (new Date().getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const result: any = {
      taskId: task.id,
      title: task.title,
      status: task.completed ? 'completed' : 'pending',
      priority: task.priority,
      createdDaysAgo,
      hasDeadline: !!task.deadline
    };

    if (task.deadline) {
      result.deadline = task.deadline.toISOString();
      result.isOverdue = isOverdue(task.deadline);
      result.isUrgent = isUrgent(task.deadline);
      result.deadlineDisplay = formatDateForDisplay(task.deadline);
    }

    if (task.completed && task.completedAt) {
      const completionTime = task.completedAt.getTime() - task.createdAt.getTime();
      result.completionTimeHours = Math.round(completionTime / (1000 * 60 * 60));
      result.completedAt = task.completedAt.toISOString();
    }

    return result;
  }

  /**
   * Bulk update task completion status
   * @param taskIds - Array of task IDs
   * @param completed - Whether the tasks should be completed
   * @returns Promise that resolves to array of updated task responses
   */
  async bulkUpdateCompletion(taskIds: string[], completed: boolean): Promise<TaskResponse[]> {
    const results: TaskResponse[] = [];

    for (const taskId of taskIds) {
      try {
        const updatedTask = await this.updateTaskCompletion(taskId, completed);
        results.push(updatedTask);
      } catch (error) {
        // Log error but continue with other tasks
        console.error(`Failed to update task ${taskId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get task priority distribution for a list
   * @param listId - The list ID
   * @returns Promise that resolves to priority distribution
   * @throws {ListNotFoundError} If list is not found
   */
  async getTaskPriorityDistribution(listId: string) {
    // Verify the list exists
    const listExists = await this.listRepository.exists(listId);
    if (!listExists) {
      throw new ListNotFoundError(listId);
    }

    const tasks = await this.taskRepository.findByListId(listId);

    const distribution = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.URGENT]: 0
    };

    tasks.forEach(task => {
      distribution[task.priority]++;
    });

    return {
      listId,
      totalTasks: tasks.length,
      distribution,
      percentages: {
        [TaskPriority.LOW]:
          tasks.length > 0 ? (distribution[TaskPriority.LOW] / tasks.length) * 100 : 0,
        [TaskPriority.MEDIUM]:
          tasks.length > 0 ? (distribution[TaskPriority.MEDIUM] / tasks.length) * 100 : 0,
        [TaskPriority.HIGH]:
          tasks.length > 0 ? (distribution[TaskPriority.HIGH] / tasks.length) * 100 : 0,
        [TaskPriority.URGENT]:
          tasks.length > 0 ? (distribution[TaskPriority.URGENT] / tasks.length) * 100 : 0
      }
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
