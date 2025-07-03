import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ApiError);
  }
}

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  // Handle known API errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = error.message;
  }
  // Handle JSON parsing errors
  else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }
  // Handle database errors
  else if (error.name === 'DatabaseError') {
    statusCode = 500;
    code = 'DATABASE_ERROR';
    message = 'Database operation failed';
    // Don't expose internal database details in production
    if (process.env.NODE_ENV === 'development') {
      details = error.message;
    }
  }
  // Handle other known errors
  else if (error.message.includes('not found')) {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = error.message;
  } else if (error.message.includes('unauthorized')) {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Authentication required';
  } else if (error.message.includes('forbidden')) {
    statusCode = 403;
    code = 'FORBIDDEN';
    message = 'Access denied';
  }

  // Error response format
  const errorResponse = {
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack
      })
    }
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create standard API errors
 */
export const createError = {
  badRequest: (message: string, details?: unknown): ApiError =>
    new ApiError(message, 400, 'BAD_REQUEST', details),

  unauthorized: (message = 'Authentication required'): ApiError =>
    new ApiError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message = 'Access denied'): ApiError => new ApiError(message, 403, 'FORBIDDEN'),

  notFound: (resource = 'Resource'): ApiError =>
    new ApiError(`${resource} not found`, 404, 'NOT_FOUND'),

  conflict: (message: string): ApiError => new ApiError(message, 409, 'CONFLICT'),

  unprocessableEntity: (message: string, details?: unknown): ApiError =>
    new ApiError(message, 422, 'UNPROCESSABLE_ENTITY', details),

  internalServer: (message = 'Internal server error'): ApiError =>
    new ApiError(message, 500, 'INTERNAL_SERVER_ERROR'),

  notImplemented: (message = 'Feature not implemented'): ApiError =>
    new ApiError(message, 501, 'NOT_IMPLEMENTED'),

  serviceUnavailable: (message = 'Service temporarily unavailable'): ApiError =>
    new ApiError(message, 503, 'SERVICE_UNAVAILABLE')
};
