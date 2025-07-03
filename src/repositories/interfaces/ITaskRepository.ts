/**
 * Repository interface for Task entity operations
 */

import { Task, CreateTaskRequest, UpdateTaskRequest, TaskQuery } from '../../types/task.types';

export interface ITaskRepository {
  /**
   * Create a new task
   * @param listId - The ID of the list to create the task in
   * @param userId - The ID of the user creating the task
   * @param taskData - Data for creating the task
   * @returns Promise that resolves to the created task
   */
  create(listId: string, userId: string, taskData: CreateTaskRequest): Promise<Task>;

  /**
   * Find a task by its ID and user ID
   * @param id - The task ID
   * @param userId - The user ID
   * @returns Promise that resolves to the task or null if not found
   */
  findById(id: string, userId: string): Promise<Task | null>;

  /**
   * Find all tasks for a specific list and user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to an array of tasks
   */
  findByListId(listId: string, userId: string): Promise<Task[]>;

  /**
   * Find tasks based on query parameters for a specific user
   * @param query - Query parameters for filtering and sorting
   * @param userId - The user ID
   * @param listId - Optional list ID to filter by
   * @returns Promise that resolves to an array of tasks
   */
  findByQuery(query: TaskQuery, userId: string, listId?: string): Promise<Task[]>;

  /**
   * Update a task by its ID and user ID
   * @param id - The task ID
   * @param userId - The user ID
   * @param updateData - Data for updating the task
   * @returns Promise that resolves to the updated task or null if not found
   */
  update(id: string, userId: string, updateData: UpdateTaskRequest): Promise<Task | null>;

  /**
   * Update task completion status
   * @param id - The task ID
   * @param userId - The user ID
   * @param completed - Whether the task is completed
   * @returns Promise that resolves to the updated task or null if not found
   */
  updateCompletion(id: string, userId: string, completed: boolean): Promise<Task | null>;

  /**
   * Update task deadline
   * @param id - The task ID
   * @param userId - The user ID
   * @param deadline - New deadline for the task
   * @returns Promise that resolves to the updated task or null if not found
   */
  updateDeadline(id: string, userId: string, deadline: Date): Promise<Task | null>;

  /**
   * Delete a task by its ID and user ID
   * @param id - The task ID
   * @param userId - The user ID
   * @returns Promise that resolves to true if deleted, false if not found
   */
  delete(id: string, userId: string): Promise<boolean>;

  /**
   * Delete all tasks for a specific list and user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to the number of tasks deleted
   */
  deleteByListId(listId: string, userId: string): Promise<number>;

  /**
   * Check if a task exists by its ID and user ID
   * @param id - The task ID
   * @param userId - The user ID
   * @returns Promise that resolves to true if exists, false otherwise
   */
  exists(id: string, userId: string): Promise<boolean>;

  /**
   * Get tasks due this week for a specific user
   * @param userId - The user ID
   * @returns Promise that resolves to an array of tasks
   */
  findDueThisWeek(userId: string): Promise<Task[]>;

  /**
   * Count tasks in a specific list for a user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to the task count
   */
  countByListId(listId: string, userId: string): Promise<number>;
}
