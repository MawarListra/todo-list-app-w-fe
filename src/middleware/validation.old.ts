/**
 * Validation middleware for request validation
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../exceptions/customExceptions';

/**
 * Create a validation middleware for request body
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new ValidationError('Request body validation failed', details));
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
}

/**
 * Create a validation middleware for request parameters
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
export function validateParams(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new ValidationError('Request parameters validation failed', details));
    }

    // Replace request params with validated data
    req.params = value;
    next();
  };
}

/**
 * Create a validation middleware for query parameters
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new ValidationError('Query parameters validation failed', details));
    }

    // Replace request query with validated data
    req.query = value;
    next();
  };
}

/**
 * Middleware to validate UUID parameters
 */
export function validateUuidParam(paramName: string) {
  const schema = Joi.object({
    [paramName]: Joi.string().uuid().required()
  });

  return validateParams(schema);
}

/**
 * Middleware for optional query parameter validation
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
export function validateOptionalQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only validate if query parameters are present
    if (Object.keys(req.query).length === 0) {
      return next();
    }

    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new ValidationError('Query parameters validation failed', details));
    }

    // Replace request query with validated data
    req.query = value;
    next();
  };
}

/**
 * Sanitize string inputs to prevent XSS attacks
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Basic XSS prevention - remove script tags and potentially dangerous content
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

/**
 * Middleware to validate content type for POST/PUT requests
 */
export function validateContentType(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');

    if (!contentType || !contentType.includes('application/json')) {
      return next(new ValidationError('Content-Type must be application/json'));
    }
  }

  next();
}

/**
 * Middleware to validate request size
 */
export function validateRequestSize(maxSizeBytes: number = 1024 * 1024) {
  // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('Content-Length');

    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      return next(
        new ValidationError(`Request size exceeds maximum allowed size of ${maxSizeBytes} bytes`)
      );
    }

    next();
  };
}
