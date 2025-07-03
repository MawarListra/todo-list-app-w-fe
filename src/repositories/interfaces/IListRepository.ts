/**
 * Repository interface for List entity operations
 */

import { List, CreateListRequest, UpdateListRequest } from '../../types/list.types';

export interface IListRepository {
  /**
   * Create a new list
   * @param listData - Data for creating the list
   * @param userId - ID of the user creating the list
   * @returns Promise that resolves to the created list
   */
  create(listData: CreateListRequest, userId: string): Promise<List>;

  /**
   * Find a list by its ID and user ID
   * @param id - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to the list or null if not found
   */
  findById(id: string, userId: string): Promise<List | null>;

  /**
   * Find all lists for a specific user
   * @param userId - The user ID
   * @returns Promise that resolves to an array of user's lists
   */
  findAll(userId: string): Promise<List[]>;

  /**
   * Update a list by its ID and user ID
   * @param id - The list ID
   * @param userId - The user ID
   * @param updateData - Data for updating the list
   * @returns Promise that resolves to the updated list or null if not found
   */
  update(id: string, userId: string, updateData: UpdateListRequest): Promise<List | null>;

  /**
   * Delete a list by its ID and user ID
   * @param id - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to true if deleted, false if not found
   */
  delete(id: string, userId: string): Promise<boolean>;

  /**
   * Check if a list exists by its ID and user ID
   * @param id - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to true if exists, false otherwise
   */
  exists(id: string, userId: string): Promise<boolean>;

  /**
   * Get the count of tasks in a list for a specific user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to the task count
   */
  getTaskCount(listId: string, userId: string): Promise<number>;
}
