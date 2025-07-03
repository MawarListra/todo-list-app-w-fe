/**
 * Validation utilities for Task entities
 */

import Joi from 'joi';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskQuery,
  TaskPriority
} from '../../types/task.types';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskDeadlineSchema,
  updateTaskCompletionSchema,
  taskQuerySchema
} from '../../schemas/validation.schemas';
import { TaskValidationError } from '../../exceptions/customExceptions';

export class TaskValidator {
  /**
   * Validate create task request data
   * @param data - The data to validate
   * @throws {TaskValidationError} If validation fails
   */
  static validateCreateRequest(data: any): CreateTaskRequest {
    const { error, value } = createTaskSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new TaskValidationError('Invalid task data', details);
    }

    return value as CreateTaskRequest;
  }

  /**
   * Validate update task request data
   * @param data - The data to validate
   * @throws {TaskValidationError} If validation fails
   */
  static validateUpdateRequest(data: any): UpdateTaskRequest {
    const { error, value } = updateTaskSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new TaskValidationError('Invalid task data', details);
    }

    return value as UpdateTaskRequest;
  }

  /**
   * Validate task deadline update request
   * @param data - The data to validate
   * @throws {TaskValidationError} If validation fails
   */
  static validateDeadlineUpdate(data: any): { deadline: string | null } {
    const { error, value } = updateTaskDeadlineSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new TaskValidationError('Invalid deadline data', details);
    }

    return value as { deadline: string | null };
  }

  /**
   * Validate task completion update request
   * @param data - The data to validate
   * @throws {TaskValidationError} If validation fails
   */
  static validateCompletionUpdate(data: any): { completed: boolean } {
    const { error, value } = updateTaskCompletionSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new TaskValidationError('Invalid completion data', details);
    }

    return value as { completed: boolean };
  }

  /**
   * Validate task query parameters
   * @param data - The query parameters to validate
   * @throws {TaskValidationError} If validation fails
   */
  static validateTaskQuery(data: any): TaskQuery {
    const { error, value } = taskQuerySchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new TaskValidationError('Invalid query parameters', details);
    }

    return value as TaskQuery;
  }

  /**
   * Validate task title
   * @param title - The task title to validate
   * @returns {boolean} True if valid
   */
  static validateTitle(title: string): boolean {
    const schema = Joi.string()
      .min(1)
      .max(200)
      .trim()
      .required();

    const { error } = schema.validate(title);
    return !error;
  }

  /**
   * Validate task description
   * @param description - The description to validate
   * @returns {boolean} True if valid
   */
  static validateDescription(description?: string): boolean {
    if (!description) return true;

    const schema = Joi.string()
      .max(1000)
      .trim()
      .optional();

    const { error } = schema.validate(description);
    return !error;
  }

  /**
   * Validate task priority
   * @param priority - The priority to validate
   * @returns {boolean} True if valid
   */
  static validatePriority(priority?: TaskPriority): boolean {
    if (!priority) return true;

    const schema = Joi.string()
      .valid('low', 'medium', 'high')
      .optional();

    const { error } = schema.validate(priority);
    return !error;
  }

  /**
   * Validate task deadline
   * @param deadline - The deadline to validate
   * @returns {boolean} True if valid
   */
  static validateDeadline(deadline?: string | null): boolean {
    if (!deadline) return true;

    const schema = Joi.string()
      .isoDate()
      .optional();

    const { error } = schema.validate(deadline);
    return !error;
  }

  /**
   * Validate task completion status
   * @param completed - The completion status to validate
   * @returns {boolean} True if valid
   */
  static validateCompleted(completed?: boolean): boolean {
    const schema = Joi.boolean().optional();
    const { error } = schema.validate(completed);
    return !error;
  }

  /**
   * Sanitize task data
   * @param data - The data to sanitize
   * @returns Sanitized data
   */
  static sanitizeTaskData(data: any): any {
    const sanitizeString = (str: string): string => {
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    };

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      
      if (data.title && typeof data.title === 'string') {
        sanitized.title = sanitizeString(data.title);
      }
      
      if (data.description && typeof data.description === 'string') {
        sanitized.description = sanitizeString(data.description);
      }
      
      if (data.priority && typeof data.priority === 'string') {
        sanitized.priority = data.priority.trim().toLowerCase();
      }

      if (data.deadline) {
        sanitized.deadline = data.deadline;
      }

      if (typeof data.completed === 'boolean') {
        sanitized.completed = data.completed;
      }

      return sanitized;
    }

    return data;
  }

  /**
   * Check if task data is complete for creation
   * @param data - The data to check
   * @returns {boolean} True if complete
   */
  static isCreateDataComplete(data: any): boolean {
    return data && 
           typeof data.title === 'string' && 
           data.title.trim().length > 0;
  }

  /**
   * Check if task data has any valid update fields
   * @param data - The data to check
   * @returns {boolean} True if has valid fields
   */
  static hasValidUpdateFields(data: any): boolean {
    return data && 
           (data.title !== undefined || 
            data.description !== undefined || 
            data.priority !== undefined ||
            data.deadline !== undefined ||
            data.completed !== undefined);
  }

  /**
   * Validate task ID format
   * @param id - The ID to validate
   * @returns {boolean} True if valid UUID
   */
  static validateTaskId(id: string): boolean {
    const schema = Joi.string().uuid().required();
    const { error } = schema.validate(id);
    return !error;
  }

  /**
   * Validate list ID format
   * @param id - The ID to validate
   * @returns {boolean} True if valid UUID
   */
  static validateListId(id: string): boolean {
    const schema = Joi.string().uuid().required();
    const { error } = schema.validate(id);
    return !error;
  }

  /**
   * Check if deadline is in the future
   * @param deadline - The deadline to check
   * @returns {boolean} True if in future
   */
  static isDeadlineInFuture(deadline: string): boolean {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return deadlineDate > now;
  }

  /**
   * Check if deadline is within the next week
   * @param deadline - The deadline to check
   * @returns {boolean} True if within next week
   */
  static isDeadlineThisWeek(deadline: string): boolean {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return deadlineDate >= now && deadlineDate <= oneWeekFromNow;
  }

  /**
   * Get validation error messages
   * @param error - Joi validation error
   * @returns Formatted error messages
   */
  static getErrorMessages(error: Joi.ValidationError): string[] {
    return error.details.map((detail: Joi.ValidationErrorItem) => detail.message);
  }

  /**
   * Validate sort criteria
   * @param sortBy - The field to sort by
   * @param order - The sort order
   * @returns {boolean} True if valid
   */
  static validateSortCriteria(sortBy?: string, order?: string): boolean {
    const sortBySchema = Joi.string()
      .valid('title', 'priority', 'deadline', 'createdAt', 'updatedAt')
      .optional();
    
    const orderSchema = Joi.string()
      .valid('asc', 'desc')
      .optional();

    const { error: sortByError } = sortBySchema.validate(sortBy);
    const { error: orderError } = orderSchema.validate(order);

    return !sortByError && !orderError;
  }
}
