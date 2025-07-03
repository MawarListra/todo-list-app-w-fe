/**
 * In-memory data store for development and testing
 */

import { List } from '../../types/list.types';
import { Task } from '../../types/task.types';

export class MemoryStore {
  private static instance: MemoryStore;
  private lists: Map<string, List> = new Map();
  private tasks: Map<string, Task> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of MemoryStore
   */
  public static getInstance(): MemoryStore {
    if (!MemoryStore.instance) {
      MemoryStore.instance = new MemoryStore();
    }
    return MemoryStore.instance;
  }

  /**
   * Get all lists
   */
  public getLists(): Map<string, List> {
    return this.lists;
  }

  /**
   * Get all tasks
   */
  public getTasks(): Map<string, Task> {
    return this.tasks;
  }

  /**
   * Add a list to the store
   */
  public addList(list: List): void {
    this.lists.set(list.id, list);
  }

  /**
   * Get a list by ID
   */
  public getList(id: string): List | undefined {
    return this.lists.get(id);
  }

  /**
   * Update a list in the store
   */
  public updateList(id: string, list: List): void {
    this.lists.set(id, list);
  }

  /**
   * Delete a list from the store
   */
  public deleteList(id: string): boolean {
    return this.lists.delete(id);
  }

  /**
   * Add a task to the store
   */
  public addTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  /**
   * Get a task by ID
   */
  public getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * Update a task in the store
   */
  public updateTask(id: string, task: Task): void {
    this.tasks.set(id, task);
  }

  /**
   * Delete a task from the store
   */
  public deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * Get all tasks for a specific list
   */
  public getTasksByListId(listId: string): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.listId === listId);
  }

  /**
   * Delete all tasks for a specific list
   */
  public deleteTasksByListId(listId: string): number {
    const tasksToDelete = this.getTasksByListId(listId);
    tasksToDelete.forEach(task => this.deleteTask(task.id));
    return tasksToDelete.length;
  }

  /**
   * Clear all data (useful for testing)
   */
  public clear(): void {
    this.lists.clear();
    this.tasks.clear();
  }

  /**
   * Get store statistics
   */
  public getStats() {
    return {
      listsCount: this.lists.size,
      tasksCount: this.tasks.size,
      tasksByList: Array.from(this.lists.keys()).reduce(
        (acc, listId) => {
          acc[listId] = this.getTasksByListId(listId).length;
          return acc;
        },
        {} as Record<string, number>
      )
    };
  }
}
