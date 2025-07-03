/**
 * Service layer for List operations
 * Handles business logic, validation, and coordination between controllers and repositories
 */

import { IListRepository } from '../repositories/interfaces/IListRepository';
import { ITaskRepository } from '../repositories/interfaces/ITaskRepository';
import { RepositoryFactory } from '../repositories/repositoryFactory';
import {
  List,
  CreateListRequest,
  UpdateListRequest,
  ListResponse,
  ListWithTasks
} from '../types/list.types';
import { TaskResponse } from '../types/task.types';
import { ListValidator } from './validators/listValidator';
import { ListNotFoundError, ListValidationError } from '../exceptions/customExceptions';

/**
 * Service for managing lists and their associated business logic
 */
export class ListService {
  private listRepository: IListRepository;
  private taskRepository: ITaskRepository;

  constructor() {
    this.listRepository = RepositoryFactory.getListRepository();
    this.taskRepository = RepositoryFactory.getTaskRepository();
  }

  /**
   * Create a new list
   * @param createData - Data for creating the list
   * @param userId - ID of the user creating the list
   * @returns Promise that resolves to the created list response
   * @throws {ListValidationError} If validation fails
   */
  async createList(createData: CreateListRequest, userId: string): Promise<ListResponse> {
    // Get existing list names for uniqueness validation for this user
    const existingLists = await this.listRepository.findAll(userId);
    const existingNames = existingLists.map(list => list.name);

    // Validate the request
    const validatedData = ListValidator.validateCreateRequest(createData);

    // Create the list
    const list = await this.listRepository.create(validatedData, userId);

    // Return formatted response
    return this.formatListResponse(list);
  }

  /**
   * Get all lists for a user
   * @param userId - ID of the user
   * @param includeTaskCount - Whether to include task count for each list
   * @returns Promise that resolves to an array of list responses
   */
  async getAllLists(userId: string, includeTaskCount: boolean = true): Promise<ListResponse[]> {
    const lists = await this.listRepository.findAll(userId);

    const listResponses = await Promise.all(
      lists.map(async list => {
        const response = this.formatListResponse(list);

        if (includeTaskCount) {
          response.taskCount = await this.taskRepository.countByListId(list.id, userId);
        }

        return response;
      })
    );

    return listResponses;
  }

  /**
   * Get a list by ID for a specific user
   * @param listId - The list ID
   * @param userId - The user ID
   * @param includeTaskCount - Whether to include task count
   * @returns Promise that resolves to the list response
   * @throws {ListNotFoundError} If list is not found
   */
  async getListById(
    listId: string,
    userId: string,
    includeTaskCount: boolean = true
  ): Promise<ListResponse> {
    const list = await this.listRepository.findById(listId, userId);

    if (!list) {
      throw new ListNotFoundError(listId);
    }

    const response = this.formatListResponse(list);

    if (includeTaskCount) {
      response.taskCount = await this.taskRepository.countByListId(listId, userId);
    }

    return response;
  }

  /**
   * Get a list with its tasks for a specific user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to the list with tasks
   * @throws {ListNotFoundError} If list is not found
   */
  async getListWithTasks(listId: string, userId: string): Promise<ListWithTasks> {
    const list = await this.listRepository.findById(listId, userId);

    if (!list) {
      throw new ListNotFoundError(listId);
    }

    const tasks = await this.taskRepository.findByListId(listId, userId);
    const listResponse = this.formatListResponse(list);
    const taskResponses = tasks.map(task => this.formatTaskResponse(task));

    return {
      ...listResponse,
      tasks: taskResponses
    };
  }

  /**
   * Update a list for a specific user
   * @param listId - The list ID
   * @param userId - The user ID
   * @param updateData - Data for updating the list
   * @returns Promise that resolves to the updated list response
   * @throws {ListNotFoundError} If list is not found
   * @throws {ListValidationError} If validation fails
   */
  async updateList(
    listId: string,
    userId: string,
    updateData: UpdateListRequest
  ): Promise<ListResponse> {
    // Check if list exists and belongs to user
    const existingList = await this.listRepository.findById(listId, userId);
    if (!existingList) {
      throw new ListNotFoundError(listId);
    }

    // Get existing list names for uniqueness validation (excluding current list)
    const allLists = await this.listRepository.findAll(userId);
    const existingNames = allLists.filter(list => list.id !== listId).map(list => list.name);

    // Validate the update request
    const validatedData = ListValidator.validateUpdateRequest(updateData);

    // Update the list
    const updatedList = await this.listRepository.update(listId, userId, validatedData);

    if (!updatedList) {
      throw new ListNotFoundError(listId);
    }

    return this.formatListResponse(updatedList);
  }

  /**
   * Delete a list and all its tasks for a specific user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to true if deleted successfully
   * @throws {ListNotFoundError} If list is not found
   */
  async deleteList(listId: string, userId: string): Promise<boolean> {
    // Check if list exists and belongs to user
    const existingList = await this.listRepository.findById(listId, userId);
    if (!existingList) {
      throw new ListNotFoundError(listId);
    }

    // Delete the list (this will also delete associated tasks via repository)
    const deleted = await this.listRepository.delete(listId, userId);

    return deleted;
  }

  /**
   * Check if a list exists for a specific user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to true if list exists
   */
  async listExists(listId: string, userId: string): Promise<boolean> {
    return await this.listRepository.exists(listId, userId);
  }

  /**
   * Get list statistics for a specific user
   * @param listId - The list ID
   * @param userId - The user ID
   * @returns Promise that resolves to list statistics
   * @throws {ListNotFoundError} If list is not found
   */
  async getListStatistics(listId: string, userId: string) {
    const list = await this.listRepository.findById(listId, userId);
    if (!list) {
      throw new ListNotFoundError(listId);
    }

    const tasks = await this.taskRepository.findByListId(listId, userId);
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    const overdueTasks = tasks.filter(
      task => task.deadline && task.deadline < new Date() && !task.completed
    );

    return {
      listId,
      listName: list.name,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
    };
  }

  /**
   * Format a List entity to ListResponse
   * @private
   */
  private formatListResponse(list: List): ListResponse {
    return {
      id: list.id,
      name: list.name,
      ...(list.description !== undefined && { description: list.description }),
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString()
    };
  }

  /**
   * Format a Task entity to TaskResponse (simplified for list context)
   * @private
   */
  private formatTaskResponse(task: any): TaskResponse {
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
