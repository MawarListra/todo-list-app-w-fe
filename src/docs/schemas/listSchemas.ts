/**
 * Core entity schemas for OpenAPI documentation
 */

export const listSchemas = {
  ListResponse: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for the list',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      name: {
        type: 'string',
        description: 'Name of the list',
        example: 'Work Tasks'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Optional description of the list',
        example: 'Tasks related to work projects'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the list was created',
        example: '2025-07-01T10:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the list was last updated',
        example: '2025-07-02T14:30:00.000Z'
      },
      taskCount: {
        type: 'integer',
        description: 'Number of tasks in the list',
        example: 5
      }
    },
    required: ['id', 'name', 'createdAt', 'updatedAt', 'taskCount']
  },

  CreateListRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'Name of the list',
        example: 'Work Tasks'
      },
      description: {
        type: 'string',
        maxLength: 500,
        description: 'Optional description of the list',
        example: 'Tasks related to work projects'
      }
    },
    required: ['name']
  },

  UpdateListRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'Name of the list',
        example: 'Updated Work Tasks'
      },
      description: {
        type: 'string',
        maxLength: 500,
        description: 'Optional description of the list',
        example: 'Updated description for work tasks'
      }
    }
  }
};

export default listSchemas;
