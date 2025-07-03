/**
 * Task entity types and interfaces
 */

export interface Task {
  /** Unique identifier for the task */
  id: string;
  /** ID of the list this task belongs to */
  listId: string;
  /** Title of the task */
  title: string;
  /** Optional detailed description of the task */
  description?: string;
  /** Whether the task is completed */
  completed: boolean;
  /** Optional deadline for the task */
  deadline?: Date;
  /** Priority level of the task */
  priority: TaskPriority;
  /** Timestamp when the task was created */
  createdAt: Date;
  /** Timestamp when the task was last updated */
  updatedAt: Date;
  /** Timestamp when the task was completed (if completed) */
  completedAt?: Date;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface CreateTaskRequest {
  /** Title of the task */
  title: string;
  /** Optional detailed description of the task */
  description?: string;
  /** Optional deadline for the task (ISO string) */
  deadline?: string;
  /** Priority level of the task (defaults to 'medium') */
  priority?: TaskPriority;
}

export interface UpdateTaskRequest {
  /** Title of the task */
  title?: string;
  /** Optional detailed description of the task */
  description?: string;
  /** Optional deadline for the task (ISO string) */
  deadline?: string;
  /** Priority level of the task */
  priority?: TaskPriority;
}

export interface UpdateTaskDeadlineRequest {
  /** New deadline for the task (ISO string) */
  deadline: string;
}

export interface UpdateTaskCompletionRequest {
  /** Whether the task is completed */
  completed: boolean;
}

export interface TaskResponse {
  /** Unique identifier for the task */
  id: string;
  /** ID of the list this task belongs to */
  listId: string;
  /** Title of the task */
  title: string;
  /** Optional detailed description of the task */
  description?: string;
  /** Whether the task is completed */
  completed: boolean;
  /** Optional deadline for the task (ISO string) */
  deadline?: string;
  /** Priority level of the task */
  priority: TaskPriority;
  /** ISO string timestamp when the task was created */
  createdAt: string;
  /** ISO string timestamp when the task was last updated */
  updatedAt: string;
  /** ISO string timestamp when the task was completed (if completed) */
  completedAt?: string;
}

export interface TaskQuery {
  /** Filter by completion status */
  completed?: boolean;
  /** Filter by priority */
  priority?: TaskPriority;
  /** Filter tasks due before this date (ISO string) */
  dueBefore?: string;
  /** Filter tasks due after this date (ISO string) */
  dueAfter?: string;
  /** Sort field */
  sortBy?: TaskSortField;
  /** Sort order */
  order?: 'asc' | 'desc';
  /** Page number for pagination */
  page?: number;
  /** Number of items per page */
  limit?: number;
}

export enum TaskSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DEADLINE = 'deadline',
  PRIORITY = 'priority',
  TITLE = 'title'
}
