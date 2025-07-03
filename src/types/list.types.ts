/**
 * List entity types and interfaces
 */

export interface List {
  /** Unique identifier for the list */
  id: string;
  /** ID of the user who owns this list */
  userId: string;
  /** Display name of the list */
  name: string;
  /** Optional description of the list */
  description?: string;
  /** Timestamp when the list was created */
  createdAt: Date;
  /** Timestamp when the list was last updated */
  updatedAt: Date;
}

export interface CreateListRequest {
  /** Display name of the list */
  name: string;
  /** Optional description of the list */
  description?: string;
}

export interface UpdateListRequest {
  /** Display name of the list */
  name?: string;
  /** Optional description of the list */
  description?: string;
}

export interface ListResponse {
  /** Unique identifier for the list */
  id: string;
  /** Display name of the list */
  name: string;
  /** Optional description of the list */
  description?: string;
  /** ISO string timestamp when the list was created */
  createdAt: string;
  /** ISO string timestamp when the list was last updated */
  updatedAt: string;
  /** Number of tasks in this list */
  taskCount?: number;
}

export interface ListWithTasks extends ListResponse {
  /** Array of tasks associated with this list */
  tasks: any[]; // Will be properly typed when task.types is imported
}
