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
      const details = error.details.map(detail => ({
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
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new TaskValidationError('Invalid task update data', details);
    }

    return value as UpdateTaskRequest;
  }

  /**
   * Validate task deadline update data
   * @param data - The data to validate
   * @throws {TaskValidationError} If validation fails
   */
  static validateDeadlineUpdate(data: any): { deadline: string } {
    const { error, value } = updateTaskDeadlineSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new TaskValidationError('Invalid deadline data', details);
    }

    return value;
  }

  /**
   * Validate task completion update data
   * @param data - The data to validate
   * @throws {TaskValidationError} If validation fails
   */
  static validateCompletionUpdate(data: any): { completed: boolean } {
    const { error, value } = updateTaskCompletionSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new TaskValidationError('Invalid completion status data', details);
    }

    return value;
  }

  /**
   * Validate task query parameters
   * @param data - The query data to validate
   * @throws {TaskValidationError} If validation fails
   */
  static validateQuery(data: any): TaskQuery {
    const { error, value } = taskQuerySchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new TaskValidationError('Invalid query parameters', details);
    }

    return value as TaskQuery;
  }

  /**
   * Validate task title format and content
   * @param title - The task title to validate
   * @throws {TaskValidationError} If title format is invalid
   */
  static validateTitleFormat(title: string): void {
    // Check for empty or whitespace-only titles
    if (!title || title.trim().length === 0) {
      throw new TaskValidationError('Task title cannot be empty or contain only whitespace');
    }

    // Check minimum length
    if (title.trim().length < 1) {
      throw new TaskValidationError('Task title must be at least 1 character long');
    }

    // Check maximum length
    if (title.length > 200) {
      throw new TaskValidationError('Task title must not exceed 200 characters');
    }

    // Check for invalid characters (optional business rule)
    const invalidCharsRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
    if (invalidCharsRegex.test(title)) {
      throw new TaskValidationError('Task title contains invalid control characters', {
        invalidCharacters: title.match(invalidCharsRegex)
      });
    }
  }

  /**
   * Validate description format
   * @param description - The description to validate
   * @throws {TaskValidationError} If description format is invalid
   */
  static validateDescriptionFormat(description?: string): void {
    if (description === undefined || description === null) {
      return; // Description is optional
    }

    // Check maximum length
    if (description.length > 1000) {
      throw new TaskValidationError('Description must not exceed 1000 characters');
    }

    // Check for invalid characters
    const invalidCharsRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
    if (invalidCharsRegex.test(description)) {
      throw new TaskValidationError('Description contains invalid control characters', {
        invalidCharacters: description.match(invalidCharsRegex)
      });
    }
  }

  /**
   * Validate deadline format and business rules
   * @param deadline - The deadline to validate (ISO string)
   * @throws {TaskValidationError} If deadline is invalid
   */
  static validateDeadline(deadline?: string): void {
    if (!deadline) {
      return; // Deadline is optional
    }

    // Check if it's a valid ISO date string
    const date = new Date(deadline);
    if (isNaN(date.getTime())) {
      throw new TaskValidationError('Invalid deadline format. Must be a valid ISO date string');
    }

    // Business rule: deadline cannot be in the past (optional)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (date < oneDayAgo) {
      throw new TaskValidationError('Deadline cannot be more than 24 hours in the past', {
        providedDeadline: deadline,
        currentTime: now.toISOString()
      });
    }

    // Business rule: deadline cannot be too far in the future (optional)
    const fiveYearsFromNow = new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000);
    if (date > fiveYearsFromNow) {
      throw new TaskValidationError('Deadline cannot be more than 5 years in the future', {
        providedDeadline: deadline,
        maxDeadline: fiveYearsFromNow.toISOString()
      });
    }
  }

  /**
   * Validate priority value
   * @param priority - The priority to validate
   * @throws {TaskValidationError} If priority is invalid
   */
  static validatePriority(priority?: TaskPriority): void {
    if (!priority) {
      return; // Priority is optional (will default to MEDIUM)
    }

    if (!Object.values(TaskPriority).includes(priority)) {
      throw new TaskValidationError(
        `Invalid priority. Must be one of: ${Object.values(TaskPriority).join(', ')}`,
        { providedPriority: priority, validPriorities: Object.values(TaskPriority) }
      );
    }
  }

  /**
   * Validate task title uniqueness within a list (business rule)
   * @param title - The task title to check
   * @param existingTitles - Array of existing task titles in the list
   * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
   * @throws {TaskValidationError} If title is not unique within the list
   */
  static validateTitleUniqueness(
    title: string,
    existingTitles: string[],
    excludeId?: string
  ): void {
    const normalizedTitle = title.trim().toLowerCase();
    const isDuplicate = existingTitles.some(
      existingTitle => existingTitle.trim().toLowerCase() === normalizedTitle
    );

    if (isDuplicate) {
      throw new TaskValidationError(
        `A task with the title '${title}' already exists in this list`,
        { duplicateTitle: title }
      );
    }
  }

  /**
   * Comprehensive validation for create request
   * @param data - The data to validate
   * @param existingTitles - Array of existing task titles in the list
   * @throws {TaskValidationError} If any validation fails
   */
  static validateCreate(data: any, existingTitles: string[] = []): CreateTaskRequest {
    // First validate the schema
    const validatedData = this.validateCreateRequest(data);

    // Then validate business rules
    this.validateTitleFormat(validatedData.title);
    this.validateDescriptionFormat(validatedData.description);
    this.validateDeadline(validatedData.deadline);
    this.validatePriority(validatedData.priority);
    this.validateTitleUniqueness(validatedData.title, existingTitles);

    return validatedData;
  }

  /**
   * Comprehensive validation for update request
   * @param data - The data to validate
   * @param existingTitles - Array of existing task titles in the list
   * @param excludeId - ID to exclude from uniqueness check
   * @throws {TaskValidationError} If any validation fails
   */
  static validateUpdate(
    data: any,
    existingTitles: string[] = [],
    excludeId?: string
  ): UpdateTaskRequest {
    // First validate the schema
    const validatedData = this.validateUpdateRequest(data);

    // Then validate business rules for fields that are being updated
    if (validatedData.title !== undefined) {
      this.validateTitleFormat(validatedData.title);
      this.validateTitleUniqueness(validatedData.title, existingTitles, excludeId);
    }

    if (validatedData.description !== undefined) {
      this.validateDescriptionFormat(validatedData.description);
    }

    if (validatedData.deadline !== undefined) {
      this.validateDeadline(validatedData.deadline);
    }

    if (validatedData.priority !== undefined) {
      this.validatePriority(validatedData.priority);
    }

    return validatedData;
  }
}
