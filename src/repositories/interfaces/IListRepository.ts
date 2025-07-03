/**
 * Repository interface for List entity operations
 */

import { List, CreateListRequest, UpdateListRequest } from '../../types/list.types';

export interface IListRepository {
  /**
   * Create a new list
   * @param listData - Data for creating the list
   * @returns Promise that resolves to the created list
   */
  create(listData: CreateListRequest): Promise<List>;

  /**
   * Find a list by its ID
   * @param id - The list ID
   * @returns Promise that resolves to the list or null if not found
   */
  findById(id: string): Promise<List | null>;

  /**
   * Find all lists
   * @returns Promise that resolves to an array of all lists
   */
  findAll(): Promise<List[]>;

  /**
   * Update a list by its ID
   * @param id - The list ID
   * @param updateData - Data for updating the list
   * @returns Promise that resolves to the updated list or null if not found
   */
  update(id: string, updateData: UpdateListRequest): Promise<List | null>;

  /**
   * Delete a list by its ID
   * @param id - The list ID
   * @returns Promise that resolves to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a list exists by its ID
   * @param id - The list ID
   * @returns Promise that resolves to true if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;

  /**
   * Get the count of tasks in a list
   * @param listId - The list ID
   * @returns Promise that resolves to the task count
   */
  getTaskCount(listId: string): Promise<number>;
}
