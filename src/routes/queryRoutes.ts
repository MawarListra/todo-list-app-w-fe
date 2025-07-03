/**
 * Routes for advanced query operations
 */

import { Router } from 'express';
import { QueryController } from '../controllers/queryController';
import { validateOptionalQuery } from '../middleware/validation';
import { taskQuerySchema } from '../schemas/validation.schemas';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const queryController = new QueryController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Queries
 *   description: Advanced query and analytics operations
 */

/**
 * GET /api/tasks/due-this-week
 * Get tasks due this week
 */
router.get('/due-this-week', queryController.getTasksDueThisWeek.bind(queryController));

/**
 * GET /api/tasks/overdue
 * Get overdue tasks
 */
router.get('/overdue', queryController.getOverdueTasks.bind(queryController));

/**
 * GET /api/tasks/statistics
 * Get overall task statistics
 */
router.get('/statistics', queryController.getTaskStatistics.bind(queryController));

/**
 * GET /api/tasks/grouped
 * Get tasks grouped by status
 */
router.get('/grouped', queryController.getTasksGrouped.bind(queryController));

/**
 * GET /api/tasks
 * Query tasks with filtering and sorting
 */
router.get(
  '/',
  validateOptionalQuery(taskQuerySchema),
  queryController.queryTasks.bind(queryController)
);

/**
 * GET /api/insights/productivity
 * Get productivity insights
 */
router.get('/insights/productivity', queryController.getProductivityInsights.bind(queryController));

export default router;
