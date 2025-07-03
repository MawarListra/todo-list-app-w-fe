/**
 * Health check routes for monitoring and deployment
 */

import { Router, Request, Response } from 'express';
import { HealthCheckResponse } from '../types/api.types';
import { RepositoryFactory } from '../repositories/repositoryFactory';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the API and its dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheckResponse'
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheckResponse'
 */
router.get('/', async (req: Request, res: Response) => {
  const startTime = process.hrtime();
  let status: 'healthy' | 'unhealthy' = 'healthy';
  let statusCode = 200;

  try {
    // Check database connectivity
    const repositoryType = RepositoryFactory.getCurrentType();
    let databaseStatus: 'connected' | 'disconnected' = 'connected';

    try {
      // For memory repository, we can always assume it's connected
      // For SQL repository, we would check actual database connection here
      if (repositoryType === 'memory') {
        databaseStatus = 'connected';
      } else {
        // TODO: Add actual database connectivity check for SQL repository
        databaseStatus = 'connected';
      }
    } catch (error) {
      databaseStatus = 'disconnected';
      status = 'unhealthy';
      statusCode = 503;
    }

    // Calculate response time
    const endTime = process.hrtime(startTime);
    const responseTimeMs = endTime[0] * 1000 + endTime[1] / 1000000;

    // Get uptime in seconds
    const uptime = process.uptime();

    const healthCheck: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: databaseStatus,
        type: repositoryType as 'memory' | 'postgresql'
      },
      uptime: Math.floor(uptime)
    };

    // Add additional health metrics
    const extendedHealthCheck = {
      ...healthCheck,
      responseTime: `${responseTimeMs.toFixed(2)}ms`,
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100
      },
      process: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    res.status(statusCode).json(extendedHealthCheck);
  } catch (error) {
    const errorHealthCheck: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'disconnected',
        type: RepositoryFactory.getCurrentType() as 'memory' | 'postgresql'
      },
      uptime: Math.floor(process.uptime())
    };

    res.status(503).json(errorHealthCheck);
  }
});

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Check if the service is ready to handle requests
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ready:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Perform readiness checks
    const repositoryType = RepositoryFactory.getCurrentType();

    // Check if repositories are properly initialized
    const listRepo = RepositoryFactory.getListRepository();
    const taskRepo = RepositoryFactory.getTaskRepository();

    if (!listRepo || !taskRepo) {
      throw new Error('Repositories not properly initialized');
    }

    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
      repositoryType
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Check if the service is alive and running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alive:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    pid: process.pid
  });
});

export default router;
