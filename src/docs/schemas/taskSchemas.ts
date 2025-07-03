/**
 * Task entity schemas for OpenAPI documentation
 */

export const taskSchemas = {
  TaskResponse: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for the task',
        example: '987fcdeb-51a2-43d7-8f9e-123456789abc'
      },
      listId: {
        type: 'string',
        format: 'uuid',
        description: 'ID of the list this task belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      title: {
        type: 'string',
        description: 'Title of the task',
        example: 'Complete project documentation'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Optional detailed description of the task',
        example: 'Write comprehensive documentation for the new feature'
      },
      completed: {
        type: 'boolean',
        description: 'Whether the task is completed',
        example: false
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        description: 'Priority level of the task',
        example: 'high'
      },
      deadline: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Optional deadline for the task',
        example: '2025-07-10T17:00:00.000Z'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the task was created',
        example: '2025-07-01T11:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the task was last updated',
        example: '2025-07-02T15:00:00.000Z'
      },
      completedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Timestamp when the task was completed',
        example: null
      }
    },
    required: ['id', 'listId', 'title', 'completed', 'priority', 'createdAt', 'updatedAt']
  },

  CreateTaskRequest: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: 'Title of the task',
        example: 'Complete project documentation'
      },
      description: {
        type: 'string',
        maxLength: 1000,
        description: 'Optional detailed description of the task',
        example: 'Write comprehensive documentation for the new feature'
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        description: 'Priority level of the task',
        example: 'high'
      },
      deadline: {
        type: 'string',
        format: 'date-time',
        description: 'Optional deadline for the task',
        example: '2025-07-10T17:00:00.000Z'
      }
    },
    required: ['title']
  },

  UpdateTaskRequest: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: 'Title of the task',
        example: 'Updated task title'
      },
      description: {
        type: 'string',
        maxLength: 1000,
        description: 'Optional detailed description of the task',
        example: 'Updated task description'
      },
      completed: {
        type: 'boolean',
        description: 'Whether the task is completed',
        example: false
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        description: 'Priority level of the task',
        example: 'urgent'
      },
      deadline: {
        type: 'string',
        format: 'date-time',
        description: 'Optional deadline for the task',
        example: '2025-07-12T18:00:00.000Z'
      }
    }
  },

  TaskQuery: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['completed', 'pending'],
        description: 'Filter by completion status'
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        description: 'Filter by priority level'
      },
      sortBy: {
        type: 'string',
        enum: ['title', 'priority', 'deadline', 'createdAt', 'updatedAt'],
        description: 'Field to sort by'
      },
      order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'asc',
        description: 'Sort order'
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
        description: 'Maximum number of results'
      },
      offset: {
        type: 'integer',
        minimum: 0,
        default: 0,
        description: 'Number of results to skip'
      }
    }
  },

  TaskStatistics: {
    type: 'object',
    properties: {
      totalTasks: {
        type: 'integer',
        description: 'Total number of tasks',
        example: 25
      },
      completedTasks: {
        type: 'integer',
        description: 'Number of completed tasks',
        example: 15
      },
      pendingTasks: {
        type: 'integer',
        description: 'Number of pending tasks',
        example: 10
      },
      overdueTasks: {
        type: 'integer',
        description: 'Number of overdue tasks',
        example: 3
      },
      tasksWithDeadlines: {
        type: 'integer',
        description: 'Number of tasks with deadlines',
        example: 18
      },
      completionRate: {
        type: 'number',
        format: 'float',
        description: 'Task completion rate as a percentage',
        example: 60.0
      },
      priorityBreakdown: {
        type: 'object',
        properties: {
          low: { type: 'integer', example: 5 },
          medium: { type: 'integer', example: 12 },
          high: { type: 'integer', example: 6 },
          urgent: { type: 'integer', example: 2 }
        }
      }
    }
  },

  GroupedTasks: {
    type: 'object',
    properties: {
      completed: {
        type: 'array',
        items: { $ref: '#/components/schemas/TaskResponse' },
        description: 'List of completed tasks'
      },
      pending: {
        type: 'array',
        items: { $ref: '#/components/schemas/TaskResponse' },
        description: 'List of pending tasks'
      }
    }
  }
};

export default taskSchemas;
