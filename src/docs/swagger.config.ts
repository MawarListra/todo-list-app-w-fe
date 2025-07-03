/**
 * Enhanced Swagger configuration with comprehensive OpenAPI documentation
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';

// Load the OpenAPI specification from YAML file
const openApiSpecPath = join(__dirname, '../docs/openapi.yaml');
let openApiSpec: any = {};

try {
  const openApiYaml = readFileSync(openApiSpecPath, 'utf8');
  openApiSpec = yaml.parse(openApiYaml);
} catch (error) {
  console.warn('Could not load OpenAPI spec from YAML file, using inline definition');
}

/**
 * Base Swagger configuration options
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'TODO List API',
      version: '1.0.0',
      description: `
        A comprehensive RESTful API for managing tasks organized within multiple lists.
        
        ## Features
        - Create and manage multiple todo lists
        - Add, update, and delete tasks within lists
        - Set deadlines and priorities for tasks
        - Track completion status
        - Advanced querying and filtering
        - Task statistics and productivity insights
        
        ## Authentication
        Currently, this API does not require authentication. All endpoints are publicly accessible.
        
        ## Rate Limiting
        API requests are rate-limited to 1000 requests per hour per IP address.
        
        ## Data Validation
        All request bodies are validated against JSON schemas. Invalid requests will return 400 Bad Request with validation details.
      `,
      contact: {
        name: 'Development Team',
        email: 'dev@todoapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://api.todolist.example.com'
            : 'http://localhost:3001',
        description:
          process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      schemas: {
        // Core entity schemas
        ListResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the list'
            },
            name: {
              type: 'string',
              description: 'Name of the list'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Optional description of the list'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the list was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the list was last updated'
            },
            taskCount: {
              type: 'integer',
              description: 'Number of tasks in the list'
            }
          }
        },
        TaskResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the task'
            },
            listId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the list this task belongs to'
            },
            title: {
              type: 'string',
              description: 'Title of the task'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Optional detailed description of the task'
            },
            completed: {
              type: 'boolean',
              description: 'Whether the task is completed'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Priority level of the task'
            },
            deadline: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Optional deadline for the task'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the task was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the task was last updated'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Timestamp when the task was completed'
            }
          }
        },
        // Request schemas
        CreateListRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Name of the list'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Optional description of the list'
            }
          }
        },
        UpdateListRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Name of the list'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Optional description of the list'
            }
          }
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Title of the task'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Optional detailed description of the task'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              default: 'medium',
              description: 'Priority level of the task'
            },
            deadline: {
              type: 'string',
              format: 'date-time',
              description: 'Optional deadline for the task'
            }
          }
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Title of the task'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Optional detailed description of the task'
            },
            completed: {
              type: 'boolean',
              description: 'Whether the task is completed'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Priority level of the task'
            },
            deadline: {
              type: 'string',
              format: 'date-time',
              description: 'Optional deadline for the task'
            }
          }
        },
        // Error schemas
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
        // Health check schemas
        HealthCheckResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              description: 'Overall health status'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of the health check'
            },
            version: {
              type: 'string',
              description: 'API version'
            },
            environment: {
              type: 'string',
              description: 'Current environment'
            },
            database: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['connected', 'disconnected']
                },
                type: {
                  type: 'string',
                  enum: ['memory', 'sql']
                }
              }
            },
            uptime: {
              type: 'integer',
              description: 'Service uptime in seconds'
            }
          }
        }
      },
      responses: {
        ValidationError: {
          description: 'Bad Request - Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/NotFoundError'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/InternalServerError'
              }
            }
          }
        }
      },
      parameters: {
        ListIdParam: {
          in: 'path',
          name: 'listId',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'The unique identifier of the list'
        },
        TaskIdParam: {
          in: 'path',
          name: 'taskId',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'The unique identifier of the task'
        }
      }
    },
    tags: [
      {
        name: 'Lists',
        description: 'Todo list management operations'
      },
      {
        name: 'Tasks',
        description: 'Task management operations within lists'
      },
      {
        name: 'Queries',
        description: 'Advanced query and analytics operations'
      },
      {
        name: 'Health',
        description: 'Health check and monitoring endpoints'
      }
    ],
    security: []
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts', './src/types/*.ts']
};

// Create Swagger specification
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Merge with loaded OpenAPI spec if available
if (Object.keys(openApiSpec).length > 0) {
  // Merge the loaded spec with the generated one
  Object.assign(swaggerSpec, openApiSpec);
}

/**
 * Swagger UI options for enhanced documentation experience
 */
export const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    defaultModelRendering: 'model',
    displayOperationId: false,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add request ID for tracking
      req.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return req;
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .swagger-ui .model-box { background: #f1f5f9; }
    .swagger-ui .model .model-title { color: #1e293b; }
    .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #22c55e; }
    .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #3b82f6; }
    .swagger-ui .opblock.opblock-put .opblock-summary { border-color: #f59e0b; }
    .swagger-ui .opblock.opblock-delete .opblock-summary { border-color: #ef4444; }
    .swagger-ui .opblock.opblock-patch .opblock-summary { border-color: #8b5cf6; }
  `,
  customSiteTitle: 'TODO List API Documentation',
  customfavIcon: '/favicon.ico'
};

/**
 * Generate OpenAPI JSON specification
 */
export const getOpenApiJson = () => {
  return JSON.stringify(swaggerSpec, null, 2);
};

/**
 * Generate OpenAPI YAML specification
 */
export const getOpenApiYaml = () => {
  return yaml.stringify(swaggerSpec, { indent: 2 });
};

/**
 * Validate the OpenAPI specification
 */
export const validateOpenApiSpec = () => {
  const errors: string[] = [];
  const spec = swaggerSpec as any; // Cast to any for validation

  // Basic validation
  if (!spec.info) {
    errors.push('Missing info section');
  }

  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    errors.push('No paths defined');
  }

  if (!spec.components?.schemas) {
    errors.push('No schemas defined');
  }

  // Validate required schemas exist
  const requiredSchemas = [
    'ListResponse',
    'TaskResponse',
    'CreateListRequest',
    'CreateTaskRequest',
    'ValidationError',
    'NotFoundError'
  ];

  for (const schema of requiredSchemas) {
    if (!spec.components?.schemas?.[schema]) {
      errors.push(`Missing required schema: ${schema}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default swaggerSpec;
