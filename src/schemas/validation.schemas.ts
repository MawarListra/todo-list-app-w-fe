/**
 * Validation schemas using Joi
 */

import Joi from 'joi';
import { TaskPriority, TaskSortField } from '../types/task.types';

// List validation schemas
export const createListSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'List name is required',
    'string.min': 'List name must be at least 1 character long',
    'string.max': 'List name must not exceed 100 characters',
    'any.required': 'List name is required'
  }),
  description: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Description must not exceed 500 characters'
  })
});

export const updateListSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional().messages({
    'string.empty': 'List name cannot be empty',
    'string.min': 'List name must be at least 1 character long',
    'string.max': 'List name must not exceed 100 characters'
  }),
  description: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Description must not exceed 500 characters'
  })
}).min(1);

// Task validation schemas
export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Task title is required',
    'string.min': 'Task title must be at least 1 character long',
    'string.max': 'Task title must not exceed 200 characters',
    'any.required': 'Task title is required'
  }),
  description: Joi.string().trim().max(1000).optional().allow('').messages({
    'string.max': 'Description must not exceed 1000 characters'
  }),
  deadline: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'Deadline must be a valid ISO date string'
  }),
  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .default(TaskPriority.MEDIUM)
    .messages({
      'any.only': `Priority must be one of: ${Object.values(TaskPriority).join(', ')}`
    })
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional().messages({
    'string.empty': 'Task title cannot be empty',
    'string.min': 'Task title must be at least 1 character long',
    'string.max': 'Task title must not exceed 200 characters'
  }),
  description: Joi.string().trim().max(1000).optional().allow('').messages({
    'string.max': 'Description must not exceed 1000 characters'
  }),
  deadline: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'Deadline must be a valid ISO date string'
  }),
  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .optional()
    .messages({
      'any.only': `Priority must be one of: ${Object.values(TaskPriority).join(', ')}`
    })
}).min(1);

export const updateTaskDeadlineSchema = Joi.object({
  deadline: Joi.string().isoDate().required().messages({
    'string.isoDate': 'Deadline must be a valid ISO date string',
    'any.required': 'Deadline is required'
  })
});

export const updateTaskCompletionSchema = Joi.object({
  completed: Joi.boolean().required().messages({
    'boolean.base': 'Completed must be a boolean value',
    'any.required': 'Completed status is required'
  })
});

// Query validation schemas
export const taskQuerySchema = Joi.object({
  completed: Joi.boolean().optional().messages({
    'boolean.base': 'Completed filter must be a boolean value'
  }),
  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .optional()
    .messages({
      'any.only': `Priority must be one of: ${Object.values(TaskPriority).join(', ')}`
    }),
  dueBefore: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'dueBefore must be a valid ISO date string'
  }),
  dueAfter: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'dueAfter must be a valid ISO date string'
  }),
  sortBy: Joi.string()
    .valid(...Object.values(TaskSortField))
    .default(TaskSortField.CREATED_AT)
    .messages({
      'any.only': `sortBy must be one of: ${Object.values(TaskSortField).join(', ')}`
    }),
  order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'order must be either "asc" or "desc"'
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100'
  })
});

// Parameter validation schemas
export const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid UUID format',
    'any.required': 'ID is required'
  })
});

export const listIdParamSchema = Joi.object({
  listId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid list ID format',
    'any.required': 'List ID is required'
  })
});

export const taskIdParamSchema = Joi.object({
  taskId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid task ID format',
    'any.required': 'Task ID is required'
  })
});
