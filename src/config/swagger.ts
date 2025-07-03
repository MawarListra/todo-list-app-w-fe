import swaggerJsdoc from 'swagger-jsdoc';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';

/**
 * Enhanced Swagger/OpenAPI configuration with comprehensive documentation
 * Uses both file-based and programmatic configuration
 */

// Try to load the comprehensive OpenAPI spec from YAML file
let openApiSpec: any = {};
try {
  const openApiSpecPath = join(__dirname, '../docs/openapi.yaml');
  const openApiYaml = readFileSync(openApiSpecPath, 'utf8');
  openApiSpec = yaml.parse(openApiYaml);
} catch (error) {
  console.warn('Could not load OpenAPI spec from YAML file, using programmatic definition');
}

/**
 * Base Swagger/OpenAPI configuration options
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
        - **List Management**: Create, read, update, and delete task lists
        - **Task Management**: Full CRUD operations for tasks within lists
        - **Deadline Tracking**: Set and manage task deadlines
        - **Task Completion**: Track task completion status with timestamps
        - **Advanced Queries**: Filter tasks by deadlines, completion status, and priority
        - **Statistics & Analytics**: Get productivity insights and task statistics
        - **Data Validation**: Comprehensive input validation and error handling
        
        ## Architecture
        The API follows a layered architecture with:
        - **API Layer**: REST endpoints with Express.js + OpenAPI documentation
        - **Service Layer**: Business logic, validation, and processing
        - **Repository Layer**: Data access (Memory + SQL implementations)
        
        ## Authentication
        Currently, the API is open for development. Authentication will be added in future versions.
        
        ## Rate Limiting
        - **Default**: 1000 requests per hour per IP
        - **Configurable**: Via environment variables
        
        ## Data Validation
        All request bodies are validated against JSON schemas. Invalid requests return 400 Bad Request with detailed validation errors.
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
        // Use the enhanced schemas from our OpenAPI spec
        ...(openApiSpec.components?.schemas || {})
      },
      responses: {
        ValidationError: {
          description: 'Bad Request - Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NotFoundError' }
            }
          }
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InternalServerError' }
            }
          }
        }
      },
      parameters: {
        ListIdParam: {
          in: 'path',
          name: 'listId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'The unique identifier of the list'
        },
        TaskIdParam: {
          in: 'path',
          name: 'taskId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'The unique identifier of the task'
        }
      }
    },
    tags: [
      { name: 'Lists', description: 'Todo list management operations' },
      { name: 'Tasks', description: 'Task management operations within lists' },
      { name: 'Queries', description: 'Advanced query and analytics operations' },
      { name: 'Health', description: 'Health check and monitoring endpoints' }
    ],
    security: []
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts', './src/types/*.ts']
};

// Create Swagger specification - merge with OpenAPI spec if available
export const swaggerSpec =
  Object.keys(openApiSpec).length > 0
    ? { ...swaggerJsdoc(swaggerOptions), ...openApiSpec }
    : swaggerJsdoc(swaggerOptions);

/**
 * Enhanced Swagger UI configuration options
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
    supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'],
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
  const spec = swaggerSpec as any;

  if (!spec.info) errors.push('Missing info section');
  if (!spec.paths || Object.keys(spec.paths).length === 0) errors.push('No paths defined');
  if (!spec.components?.schemas) errors.push('No schemas defined');

  const requiredSchemas = [
    'ListResponse',
    'TaskResponse',
    'CreateListRequest',
    'CreateTaskRequest'
  ];
  for (const schema of requiredSchemas) {
    if (!spec.components?.schemas?.[schema]) {
      errors.push(`Missing required schema: ${schema}`);
    }
  }

  return { isValid: errors.length === 0, errors };
};

export default swaggerSpec;
