import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler.js';
import { corsConfig } from './middleware/cors.js';
import { swaggerSpec } from './config/swagger.js';

// Import route modules
import listRoutes from './routes/listRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import healthRoutes from './routes/health.js';

// Load environment variables
dotenv.config();

/**
 * Express application setup and configuration
 */
export class App {
  public app: express.Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);

    this.initializeMiddleware();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware stack
   */
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:']
          }
        }
      })
    );

    // CORS configuration
    this.app.use(cors(corsConfig));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
      message: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests from this IP, please try again later.',
          retryAfter: '1 hour'
        }
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request parsing
    this.app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        memory: process.memoryUsage(),
        pid: process.pid
      };

      res.status(200).json(healthCheck);
    });

    // API version info
    this.app.get('/api', (req: Request, res: Response) => {
      res.status(200).json({
        name: 'TODO List API',
        version: process.env.npm_package_version || '1.0.0',
        description: 'A RESTful API for managing tasks organized within multiple lists',
        documentation: '/docs',
        endpoints: {
          health: '/health',
          lists: '/api/lists',
          tasks: '/api/tasks',
          docs: '/docs'
        }
      });
    });

    // API base route
    this.app.get('/api/v1', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'TODO List API v1',
        version: '1.0.0',
        documentation: '/docs'
      });
    });

    // Route modules
    this.app.use('/api/lists', listRoutes);
    this.app.use('/api/tasks', taskRoutes);
    this.app.use('/api/tasks', queryRoutes);
    this.app.use('/api/health', healthRoutes);

    // 404 handler for undefined routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`,
          availableEndpoints: ['GET /health', 'GET /api', 'GET /api/v1', 'GET /docs']
        }
      });
    });
  }

  /**
   * Initialize Swagger documentation
   */
  private initializeSwagger(): void {
    if (process.env.SWAGGER_ENABLED !== 'false') {
      const swaggerPath = process.env.SWAGGER_PATH || '/docs';

      // Swagger UI options
      const swaggerOptions = {
        explorer: true,
        swaggerOptions: {
          docExpansion: 'none',
          filter: true,
          showRequestDuration: true,
          tryItOutEnabled: true,
          requestInterceptor: (req: unknown) => {
            // Add any request interceptors here
            return req;
          }
        },
        customCss: `
          .swagger-ui .topbar { display: none }
          .swagger-ui .info { margin: 20px 0 }
        `,
        customSiteTitle: 'TODO List API Documentation'
      };

      this.app.use(swaggerPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

      console.log(
        `📚 Swagger documentation available at: http://localhost:${this.port}${swaggerPath}`
      );
    }
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  /**
   * Get the Express application instance
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Get the configured port
   */
  public getPort(): number {
    return this.port;
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    return new Promise(resolve => {
      this.app.listen(this.port, '0.0.0.0', () => {
        console.log(`🚀 TODO List API server running on port ${this.port}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📍 Health check: http://localhost:${this.port}/health`);
        console.log(`🔗 API info: http://localhost:${this.port}/api`);

        if (process.env.SWAGGER_ENABLED !== 'false') {
          console.log(`📚 API docs: http://localhost:${this.port}/docs`);
        }

        resolve();
      });
    });
  }
}
