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
      const details = error.details.map(detail => ({
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
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new ListValidationError('Invalid list update data', details);
    }

    return value as UpdateListRequest;
  }

  /**
   * Validate list name uniqueness (business rule)
   * @param name - The list name to check
   * @param existingNames - Array of existing list names
   * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
   * @throws {ListValidationError} If name is not unique
   */
  static validateNameUniqueness(name: string, existingNames: string[], excludeId?: string): void {
    const normalizedName = name.trim().toLowerCase();
    const isDuplicate = existingNames.some(
      existingName => existingName.trim().toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      throw new ListValidationError(`A list with the name '${name}' already exists`, {
        duplicateName: name
      });
    }
  }

  /**
   * Validate list name format and content
   * @param name - The list name to validate
   * @throws {ListValidationError} If name format is invalid
   */
  static validateNameFormat(name: string): void {
    // Check for empty or whitespace-only names
    if (!name || name.trim().length === 0) {
      throw new ListValidationError('List name cannot be empty or contain only whitespace');
    }

    // Check for invalid characters (optional business rule)
    const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidCharsRegex.test(name)) {
      throw new ListValidationError('List name contains invalid characters', {
        invalidCharacters: name.match(invalidCharsRegex)
      });
    }

    // Check minimum length
    if (name.trim().length < 1) {
      throw new ListValidationError('List name must be at least 1 character long');
    }

    // Check maximum length
    if (name.length > 100) {
      throw new ListValidationError('List name must not exceed 100 characters');
    }
  }

  /**
   * Validate description format
   * @param description - The description to validate
   * @throws {ListValidationError} If description format is invalid
   */
  static validateDescriptionFormat(description?: string): void {
    if (description === undefined || description === null) {
      return; // Description is optional
    }

    // Check maximum length
    if (description.length > 500) {
      throw new ListValidationError('Description must not exceed 500 characters');
    }

    // Check for invalid characters if needed (optional business rule)
    const invalidCharsRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
    if (invalidCharsRegex.test(description)) {
      throw new ListValidationError('Description contains invalid control characters', {
        invalidCharacters: description.match(invalidCharsRegex)
      });
    }
  }

  /**
   * Comprehensive validation for create request
   * @param data - The data to validate
   * @param existingNames - Array of existing list names for uniqueness check
   * @throws {ListValidationError} If any validation fails
   */
  static validateCreate(data: any, existingNames: string[] = []): CreateListRequest {
    // First validate the schema
    const validatedData = this.validateCreateRequest(data);

    // Then validate business rules
    this.validateNameFormat(validatedData.name);
    this.validateDescriptionFormat(validatedData.description);
    this.validateNameUniqueness(validatedData.name, existingNames);

    return validatedData;
  }

  /**
   * Comprehensive validation for update request
   * @param data - The data to validate
   * @param existingNames - Array of existing list names for uniqueness check
   * @param excludeId - ID to exclude from uniqueness check
   * @throws {ListValidationError} If any validation fails
   */
  static validateUpdate(
    data: any,
    existingNames: string[] = [],
    excludeId?: string
  ): UpdateListRequest {
    // First validate the schema
    const validatedData = this.validateUpdateRequest(data);

    // Then validate business rules for fields that are being updated
    if (validatedData.name !== undefined) {
      this.validateNameFormat(validatedData.name);
      this.validateNameUniqueness(validatedData.name, existingNames, excludeId);
    }

    if (validatedData.description !== undefined) {
      this.validateDescriptionFormat(validatedData.description);
    }

    return validatedData;
  }
}
