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

  async create(listData: CreateListRequest): Promise<List> {
    const now = new Date();
    const list: List = {
      id: uuidv4(),
      name: listData.name,
      ...(listData.description !== undefined && { description: listData.description }),
      createdAt: now,
      updatedAt: now
    };

    this.store.addList(list);
    return list;
  }

  async findById(id: string): Promise<List | null> {
    const list = this.store.getList(id);
    return list || null;
  }

  async findAll(): Promise<List[]> {
    return Array.from(this.store.getLists().values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async update(id: string, updateData: UpdateListRequest): Promise<List | null> {
    const existingList = this.store.getList(id);
    if (!existingList) {
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

  async delete(id: string): Promise<boolean> {
    // First check if the list exists
    const exists = this.store.getList(id);
    if (!exists) {
      return false;
    }

    // Delete all tasks associated with this list
    this.store.deleteTasksByListId(id);

    // Delete the list
    return this.store.deleteList(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.store.getList(id) !== undefined;
  }

  async getTaskCount(listId: string): Promise<number> {
    return this.store.getTasksByListId(listId).length;
  }
}
