/**
 * Memory-based implementation of Task repository
 */

import { v4 as uuidv4 } from 'uuid';
import { ITaskRepository } from '../interfaces/ITaskRepository';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskQuery,
  TaskPriority,
  TaskSortField
} from '../../types/task.types';
import { MemoryStore } from './memoryStore';

export class TaskMemoryRepository implements ITaskRepository {
  private store: MemoryStore;

  constructor() {
    this.store = MemoryStore.getInstance();
  }

  async create(listId: string, userId: string, taskData: CreateTaskRequest): Promise<Task> {
    const now = new Date();
    const task: Task = {
      id: uuidv4(),
      listId,
      userId,
      title: taskData.title,
      ...(taskData.description !== undefined && { description: taskData.description }),
      completed: false,
      ...(taskData.deadline && { deadline: new Date(taskData.deadline) }),
      priority: taskData.priority || TaskPriority.MEDIUM,
      createdAt: now,
      updatedAt: now
    };

    this.store.addTask(task);
    return task;
  }

  async findById(id: string, userId: string): Promise<Task | null> {
    const task = this.store.getTask(id);
    if (!task || task.userId !== userId) {
      return null;
    }
    return task;
  }

  async findByListId(listId: string, userId: string): Promise<Task[]> {
    return this.store
      .getTasksByListId(listId)
      .filter(task => task.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByQuery(query: TaskQuery, userId: string, listId?: string): Promise<Task[]> {
    let tasks = listId
      ? this.store.getTasksByListId(listId).filter(task => task.userId === userId)
      : Array.from(this.store.getTasks().values()).filter(task => task.userId === userId);

    // Apply filters
    if (query.completed !== undefined) {
      tasks = tasks.filter(task => task.completed === query.completed);
    }

    if (query.priority) {
      tasks = tasks.filter(task => task.priority === query.priority);
    }

    if (query.dueBefore) {
      const dueBefore = new Date(query.dueBefore);
      tasks = tasks.filter(task => task.deadline && task.deadline <= dueBefore);
    }

    if (query.dueAfter) {
      const dueAfter = new Date(query.dueAfter);
      tasks = tasks.filter(task => task.deadline && task.deadline >= dueAfter);
    }

    // Apply sorting
    const sortBy = query.sortBy || TaskSortField.CREATED_AT;
    const order = query.order || 'desc';

    tasks.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case TaskSortField.CREATED_AT:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case TaskSortField.UPDATED_AT:
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case TaskSortField.DEADLINE:
          aValue = a.deadline?.getTime() || 0;
          bValue = b.deadline?.getTime() || 0;
          break;
        case TaskSortField.PRIORITY:
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case TaskSortField.TITLE:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return tasks.slice(startIndex, endIndex);
  }

  async update(id: string, userId: string, updateData: UpdateTaskRequest): Promise<Task | null> {
    const existingTask = this.store.getTask(id);
    if (!existingTask || existingTask.userId !== userId) {
      return null;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.priority !== undefined && { priority: updateData.priority }),
      updatedAt: new Date()
    };

    // Handle deadline separately to avoid type issues
    if (updateData.deadline !== undefined) {
      if (updateData.deadline) {
        updatedTask.deadline = new Date(updateData.deadline);
      } else {
        delete updatedTask.deadline;
      }
    }

    this.store.updateTask(id, updatedTask);
    return updatedTask;
  }

  async updateCompletion(id: string, userId: string, completed: boolean): Promise<Task | null> {
    const existingTask = this.store.getTask(id);
    if (!existingTask || existingTask.userId !== userId) {
      return null;
    }

    const now = new Date();
    const updatedTask: Task = {
      ...existingTask,
      completed,
      updatedAt: now
    };

    // Handle completedAt separately to avoid type issues
    if (completed) {
      updatedTask.completedAt = now;
    } else {
      delete updatedTask.completedAt;
    }

    this.store.updateTask(id, updatedTask);
    return updatedTask;
  }

  async updateDeadline(id: string, userId: string, deadline: Date): Promise<Task | null> {
    const existingTask = this.store.getTask(id);
    if (!existingTask || existingTask.userId !== userId) {
      return null;
    }

    const updatedTask: Task = {
      ...existingTask,
      deadline,
      updatedAt: new Date()
    };

    this.store.updateTask(id, updatedTask);
    return updatedTask;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existingTask = this.store.getTask(id);
    if (!existingTask || existingTask.userId !== userId) {
      return false;
    }
    return this.store.deleteTask(id);
  }

  async deleteByListId(listId: string, userId: string): Promise<number> {
    // First, get all tasks for the list that belong to the user
    const tasks = this.store.getTasksByListId(listId).filter(task => task.userId === userId);
    let deletedCount = 0;

    for (const task of tasks) {
      if (this.store.deleteTask(task.id)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const task = this.store.getTask(id);
    return task !== undefined && task.userId === userId;
  }

  async findDueThisWeek(userId: string): Promise<Task[]> {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return Array.from(this.store.getTasks().values())
      .filter(
        task =>
          task.userId === userId &&
          task.deadline &&
          task.deadline >= now &&
          task.deadline <= oneWeekFromNow &&
          !task.completed
      )
      .sort((a, b) => {
        if (!a.deadline || !b.deadline) return 0;
        return a.deadline.getTime() - b.deadline.getTime();
      });
  }

  async countByListId(listId: string, userId: string): Promise<number> {
    return this.store.getTasksByListId(listId).filter(task => task.userId === userId).length;
  }
}
