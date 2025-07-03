/**
 * Repository factory for dependency injection and environment-based repository selection
 */

import { IListRepository } from './interfaces/IListRepository.js';
import { ITaskRepository } from './interfaces/ITaskRepository.js';
import { IUserRepository } from './interfaces/IUserRepository.js';
import { ListMemoryRepository } from './memory/listMemoryRepository.js';
import { TaskMemoryRepository } from './memory/taskMemoryRepository.js';
import { UserMemoryRepository } from './memory/userMemoryRepository.js';

export enum RepositoryType {
  MEMORY = 'memory',
  SQL = 'sql'
}

export class RepositoryFactory {
  private static listRepository: IListRepository | null = null;
  private static taskRepository: ITaskRepository | null = null;
  private static userRepository: IUserRepository | null = null;
  private static currentType: RepositoryType | null = null;

  /**
   * Configure the repository type based on environment
   */
  public static configure(type: RepositoryType = RepositoryType.MEMORY): void {
    if (this.currentType === type) {
      return; // Already configured
    }

    console.log(`🔧 Configuring repositories for type: ${type}`);

    this.currentType = type;
    this.listRepository = null;
    this.taskRepository = null;
    this.userRepository = null;
  }

  /**
   * Get the list repository instance
   */
  public static getListRepository(): IListRepository {
    if (!this.listRepository) {
      this.listRepository = this.createListRepository();
    }
    return this.listRepository;
  }

  /**
   * Get the task repository instance
   */
  public static getTaskRepository(): ITaskRepository {
    if (!this.taskRepository) {
      this.taskRepository = this.createTaskRepository();
    }
    return this.taskRepository;
  }

  /**
   * Get the user repository instance
   */
  public static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = this.createUserRepository();
    }
    return this.userRepository;
  }

  /**
   * Create a list repository based on the current type
   */
  private static createListRepository(): IListRepository {
    const type = this.currentType || RepositoryType.MEMORY;

    switch (type) {
      case RepositoryType.MEMORY:
        return new ListMemoryRepository();
      case RepositoryType.SQL:
        // TODO: Implement SQL repository
        throw new Error('SQL repository not yet implemented');
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }

  /**
   * Create a task repository based on the current type
   */
  private static createTaskRepository(): ITaskRepository {
    const type = this.currentType || RepositoryType.MEMORY;

    switch (type) {
      case RepositoryType.MEMORY:
        return new TaskMemoryRepository();
      case RepositoryType.SQL:
        // TODO: Implement SQL repository
        throw new Error('SQL repository not yet implemented');
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }

  /**
   * Create a user repository based on the current type
   */
  private static createUserRepository(): IUserRepository {
    const type = this.currentType || RepositoryType.MEMORY;

    switch (type) {
      case RepositoryType.MEMORY:
        return new UserMemoryRepository();
      case RepositoryType.SQL:
        // TODO: Implement SQL repository
        throw new Error('SQL repository not yet implemented');
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }

  /**
   * Get the current repository type
   */
  public static getCurrentType(): RepositoryType {
    return this.currentType || RepositoryType.MEMORY;
  }

  /**
   * Reset the factory (useful for testing)
   */
  public static reset(): void {
    this.listRepository = null;
    this.taskRepository = null;
    this.userRepository = null;
    this.currentType = null;
  }

  /**
   * Initialize repositories based on environment configuration
   */
  public static initializeFromEnvironment(): void {
    const repositoryType = (process.env.REPOSITORY_TYPE as RepositoryType) || RepositoryType.MEMORY;

    if (!Object.values(RepositoryType).includes(repositoryType)) {
      console.warn(`⚠️  Invalid REPOSITORY_TYPE: ${repositoryType}, defaulting to memory`);
      this.configure(RepositoryType.MEMORY);
    } else {
      this.configure(repositoryType);
    }

    console.log(`📦 Repositories initialized with type: ${this.getCurrentType()}`);
  }
}
