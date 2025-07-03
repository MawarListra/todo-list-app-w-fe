/**
 * Common API types for requests and responses
 */

export interface ApiResponse<T = any> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Optional message */
  message?: string;
  /** Timestamp of the response */
  timestamp: string;
}

export interface ApiErrorResponse {
  /** Error details */
  error: {
    /** Error message */
    message: string;
    /** Error code */
    code: string;
    /** Additional error details */
    details?: any;
  };
  /** Success status (always false for errors) */
  success: false;
  /** Timestamp of the response */
  timestamp: string;
}

export interface PaginationRequest {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  limit?: number;
}

export interface PaginationResponse {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  /** Pagination metadata */
  pagination: PaginationResponse;
}

export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Validation error message */
  message: string;
  /** Value that failed validation */
  value?: any;
}

export interface ValidationErrorResponse extends ApiErrorResponse {
  error: {
    message: string;
    code: 'VALIDATION_ERROR';
    /** Array of validation errors */
    details: ValidationError[];
  };
}

export interface NotFoundErrorResponse extends ApiErrorResponse {
  error: {
    message: string;
    code: 'NOT_FOUND';
    /** Resource type that was not found */
    resource?: string;
    /** Resource ID that was not found */
    resourceId?: string;
  };
}

export interface ConflictErrorResponse extends ApiErrorResponse {
  error: {
    message: string;
    code: 'CONFLICT';
    /** Details about the conflict */
    details?: any;
  };
}

export interface InternalServerErrorResponse extends ApiErrorResponse {
  error: {
    message: string;
    code: 'INTERNAL_SERVER_ERROR';
    /** Request ID for tracking */
    requestId?: string;
  };
}

// Health check types
export interface HealthCheckResponse {
  /** Service status */
  status: 'healthy' | 'unhealthy';
  /** Timestamp of the check */
  timestamp: string;
  /** Service version */
  version: string;
  /** Environment */
  environment: string;
  /** Database connection status */
  database: {
    status: 'connected' | 'disconnected';
    type: 'memory' | 'postgresql';
  };
  /** Uptime in seconds */
  uptime: number;
}
