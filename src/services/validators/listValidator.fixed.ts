/**
 * Validation utilities for List entities
 */

import Joi from 'joi';
import { CreateListRequest, UpdateListRequest } from '../../types/list.types';
import { createListSchema, updateListSchema } from '../../schemas/validation.schemas';
import { ListValidationError } from '../../exceptions/customExceptions';

export class ListValidator {
  /**
   * Validate create list request data
   * @param data - The data to validate
   * @throws {ListValidationError} If validation fails
   */
  static validateCreateRequest(data: any): CreateListRequest {
    const { error, value } = createListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new ListValidationError('Invalid list data', details);
    }

    return value as CreateListRequest;
  }

  /**
   * Validate update list request data
   * @param data - The data to validate
   * @throws {ListValidationError} If validation fails
   */
  static validateUpdateRequest(data: any): UpdateListRequest {
    const { error, value } = updateListSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail: Joi.ValidationErrorItem) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new ListValidationError('Invalid list data', details);
    }

    return value as UpdateListRequest;
  }

  /**
   * Validate list name
   * @param name - The list name to validate
   * @returns {boolean} True if valid
   */
  static validateListName(name: string): boolean {
    const schema = Joi.string().min(1).max(100).trim().required();

    const { error } = schema.validate(name);
    return !error;
  }

  /**
   * Validate list description
   * @param description - The description to validate
   * @returns {boolean} True if valid
   */
  static validateDescription(description?: string): boolean {
    if (!description) return true;

    const schema = Joi.string().max(500).trim().optional();

    const { error } = schema.validate(description);
    return !error;
  }

  /**
   * Validate list color
   * @param color - The color code to validate
   * @returns {boolean} True if valid
   */
  static validateColor(color?: string): boolean {
    if (!color) return true;

    const schema = Joi.string()
      .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .optional();

    const { error } = schema.validate(color);
    return !error;
  }

  /**
   * Sanitize list data
   * @param data - The data to sanitize
   * @returns Sanitized data
   */
  static sanitizeListData(data: any): any {
    const sanitizeString = (str: string): string => {
      return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    };

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};

      if (data.name && typeof data.name === 'string') {
        sanitized.name = sanitizeString(data.name);
      }

      if (data.description && typeof data.description === 'string') {
        sanitized.description = sanitizeString(data.description);
      }

      if (data.color && typeof data.color === 'string') {
        sanitized.color = data.color.trim();
      }

      return sanitized;
    }

    return data;
  }

  /**
   * Check if list data is complete for creation
   * @param data - The data to check
   * @returns {boolean} True if complete
   */
  static isCreateDataComplete(data: any): boolean {
    return data && typeof data.name === 'string' && data.name.trim().length > 0;
  }

  /**
   * Check if list data has any valid update fields
   * @param data - The data to check
   * @returns {boolean} True if has valid fields
   */
  static hasValidUpdateFields(data: any): boolean {
    return (
      data &&
      (data.name !== undefined || data.description !== undefined || data.color !== undefined)
    );
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
   * Get validation error messages
   * @param error - Joi validation error
   * @returns Formatted error messages
   */
  static getErrorMessages(error: Joi.ValidationError): string[] {
    return error.details.map((detail: Joi.ValidationErrorItem) => detail.message);
  }
}
