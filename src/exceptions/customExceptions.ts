/**
 * Custom exception classes for the application
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    // Restore prototype chain
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly details?: any;

  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  public readonly resource?: string;
  public readonly resourceId?: string;

  constructor(message: string, resource?: string, resourceId?: string) {
    super(message, 404, 'NOT_FOUND');
    if (resource) this.resource = resource;
    if (resourceId) this.resourceId = resourceId;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  public readonly details?: any;

  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT');
    this.details = details;
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class InternalServerError extends AppError {
  public readonly requestId?: string;

  constructor(message: string = 'Internal Server Error', requestId?: string) {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    if (requestId) this.requestId = requestId;
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

// List-specific errors
export class ListNotFoundError extends NotFoundError {
  constructor(listId: string) {
    super(`List with ID '${listId}' not found`, 'list', listId);
    Object.setPrototypeOf(this, ListNotFoundError.prototype);
  }
}

export class ListValidationError extends ValidationError {
  constructor(message: string, details?: any) {
    super(`List validation failed: ${message}`, details);
    Object.setPrototypeOf(this, ListValidationError.prototype);
  }
}

// Task-specific errors
export class TaskNotFoundError extends NotFoundError {
  constructor(taskId: string) {
    super(`Task with ID '${taskId}' not found`, 'task', taskId);
    Object.setPrototypeOf(this, TaskNotFoundError.prototype);
  }
}

export class TaskValidationError extends ValidationError {
  constructor(message: string, details?: any) {
    super(`Task validation failed: ${message}`, details);
    Object.setPrototypeOf(this, TaskValidationError.prototype);
  }
}

export class TaskListMismatchError extends BadRequestError {
  constructor(taskId: string, listId: string) {
    super(`Task '${taskId}' does not belong to list '${listId}'`);
    Object.setPrototypeOf(this, TaskListMismatchError.prototype);
  }
}

// Database-specific errors
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(`Database error: ${message}`, 500, 'DATABASE_ERROR');
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string = 'Database connection failed') {
    super(message);
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

// Export utility functions for error handling
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

export const createErrorResponse = (error: AppError) => {
  const response: any = {
    error: {
      message: error.message,
      code: error.code
    },
    success: false,
    timestamp: new Date().toISOString()
  };

  // Add additional error details if available
  if (error instanceof ValidationError && error.details) {
    response.error.details = error.details;
  }

  if (error instanceof NotFoundError) {
    if (error.resource) response.error.resource = error.resource;
    if (error.resourceId) response.error.resourceId = error.resourceId;
  }

  if (error instanceof ConflictError && error.details) {
    response.error.details = error.details;
  }

  if (error instanceof InternalServerError && error.requestId) {
    response.error.requestId = error.requestId;
  }

  return response;
};
