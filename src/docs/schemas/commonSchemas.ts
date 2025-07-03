/**
 * Common response and error schemas for OpenAPI documentation
 */

export const commonSchemas = {
  ApiResponse: {
    type: 'object',
    properties: {
      data: {
        description: 'Response data'
      },
      success: {
        type: 'boolean',
        description: 'Whether the request was successful',
        example: true
      },
      message: {
        type: 'string',
        description: 'Response message',
        example: 'Operation completed successfully'
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp of the response',
        example: '2025-07-02T10:30:00.000Z'
      }
    },
    required: ['data', 'success', 'message', 'timestamp']
  },

  PaginatedResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        description: 'Array of response items'
      },
      pagination: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            description: 'Total number of items',
            example: 100
          },
          limit: {
            type: 'integer',
            description: 'Number of items per page',
            example: 20
          },
          offset: {
            type: 'integer',
            description: 'Number of items skipped',
            example: 0
          },
          hasNext: {
            type: 'boolean',
            description: 'Whether there are more items',
            example: true
          },
          hasPrev: {
            type: 'boolean',
            description: 'Whether there are previous items',
            example: false
          }
        }
      },
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Items retrieved successfully'
      },
      timestamp: {
        type: 'string',
        format: 'date-time'
      }
    }
  },

  ValidationError: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            example: 'VALIDATION_ERROR'
          },
          message: {
            type: 'string',
            example: 'Validation failed'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'title'
                },
                message: {
                  type: 'string',
                  example: 'Title is required'
                },
                value: {
                  oneOf: [
                    { type: 'string' },
                    { type: 'number' },
                    { type: 'boolean' },
                    { type: 'null' }
                  ]
                }
              }
            }
          }
        }
      },
      timestamp: {
        type: 'string',
        format: 'date-time'
      }
    }
  },

  NotFoundError: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            example: 'RESOURCE_NOT_FOUND'
          },
          message: {
            type: 'string',
            example: 'The requested resource was not found'
          },
          resource: {
            type: 'string',
            example: 'Task'
          },
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          }
        }
      },
      timestamp: {
        type: 'string',
        format: 'date-time'
      }
    }
  },

  InternalServerError: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            example: 'INTERNAL_SERVER_ERROR'
          },
          message: {
            type: 'string',
            example: 'An unexpected error occurred'
          },
          requestId: {
            type: 'string',
            example: 'req_123456789'
          }
        }
      },
      timestamp: {
        type: 'string',
        format: 'date-time'
      }
    }
  },

  HealthCheckResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['healthy', 'unhealthy'],
        description: 'Overall health status',
        example: 'healthy'
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp of the health check',
        example: '2025-07-02T10:30:00.000Z'
      },
      version: {
        type: 'string',
        description: 'API version',
        example: '1.0.0'
      },
      environment: {
        type: 'string',
        description: 'Current environment',
        example: 'development'
      },
      database: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['connected', 'disconnected'],
            example: 'connected'
          },
          type: {
            type: 'string',
            enum: ['memory', 'sql'],
            example: 'memory'
          }
        }
      },
      uptime: {
        type: 'integer',
        description: 'Service uptime in seconds',
        example: 3600
      }
    }
  },

  ReadinessResponse: {
    type: 'object',
    properties: {
      ready: {
        type: 'boolean',
        description: 'Whether the service is ready',
        example: true
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp of the readiness check',
        example: '2025-07-02T10:30:00.000Z'
      },
      checks: {
        type: 'object',
        properties: {
          database: {
            type: 'string',
            enum: ['pass', 'fail'],
            example: 'pass'
          }
        }
      }
    }
  },

  LivenessResponse: {
    type: 'object',
    properties: {
      alive: {
        type: 'boolean',
        description: 'Whether the service is alive',
        example: true
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp of the liveness check',
        example: '2025-07-02T10:30:00.000Z'
      }
    }
  }
};

export default commonSchemas;
