/**
 * Memory-based implementation of List repository
 */

import { v4 as uuidv4 } from 'uuid';
import { IListRepository } from '../interfaces/IListRepository';
import { List, CreateListRequest, UpdateListRequest } from '../../types/list.types';
import { MemoryStore } from './memoryStore';

export class ListMemoryRepository implements IListRepository {
  private store: MemoryStore;

  constructor() {
    this.store = MemoryStore.getInstance();
  }

  async create(listData: CreateListRequest, userId: string): Promise<List> {
    const now = new Date();
    const list: List = {
      id: uuidv4(),
      userId,
      name: listData.name,
      ...(listData.description !== undefined && { description: listData.description }),
      createdAt: now,
      updatedAt: now
    };

    this.store.addList(list);
    return list;
  }

  async findById(id: string, userId: string): Promise<List | null> {
    const list = this.store.getList(id);
    if (!list || list.userId !== userId) {
      return null;
    }
    return list;
  }

  async findAll(userId: string): Promise<List[]> {
    return Array.from(this.store.getLists().values())
      .filter(list => list.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(id: string, userId: string, updateData: UpdateListRequest): Promise<List | null> {
    const existingList = this.store.getList(id);
    if (!existingList || existingList.userId !== userId) {
      return null;
    }

    const updatedList: List = {
      ...existingList,
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      updatedAt: new Date()
    };

    this.store.updateList(id, updatedList);
    return updatedList;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    // First check if the list exists and belongs to the user
    const exists = this.store.getList(id);
    if (!exists || exists.userId !== userId) {
      return false;
    }

    // Delete all tasks associated with this list
    this.store.deleteTasksByListId(id);

    // Delete the list
    return this.store.deleteList(id);
  }

  async exists(id: string, userId: string): Promise<boolean> {
    const list = this.store.getList(id);
    return list !== undefined && list.userId === userId;
  }

  async getTaskCount(listId: string, userId: string): Promise<number> {
    // Verify the list belongs to the user before counting tasks
    const list = this.store.getList(listId);
    if (!list || list.userId !== userId) {
      return 0;
    }
    return this.store.getTasksByListId(listId).filter(task => task.userId === userId).length;
  }
}
