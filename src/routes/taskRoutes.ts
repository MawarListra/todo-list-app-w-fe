/**
 * Routes for Task operations
 */

import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { validateBody, validateParams } from '../middleware/validation';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskDeadlineSchema,
  updateTaskCompletionSchema,
  listIdParamSchema,
  taskIdParamSchema
} from '../schemas/validation.schemas';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const taskController = new TaskController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management operations
 */

/**
 * POST /api/lists/:listId/tasks
 * Create a new task in a list
 */
router.post(
  '/lists/:listId/tasks',
  validateParams(listIdParamSchema),
  validateBody(createTaskSchema),
  taskController.createTask.bind(taskController)
);

/**
 * GET /api/tasks/:taskId
 * Get a specific task by ID
 */
router.get(
  '/:taskId',
  validateParams(taskIdParamSchema),
  taskController.getTaskById.bind(taskController)
);

/**
 * PUT /api/tasks/:taskId
 * Update a task
 */
router.put(
  '/:taskId',
  validateParams(taskIdParamSchema),
  validateBody(updateTaskSchema),
  taskController.updateTask.bind(taskController)
);

/**
 * DELETE /api/tasks/:taskId
 * Delete a task
 */
router.delete(
  '/:taskId',
  validateParams(taskIdParamSchema),
  taskController.deleteTask.bind(taskController)
);

/**
 * PATCH /api/tasks/:taskId/deadline
 * Update task deadline
 */
router.patch(
  '/:taskId/deadline',
  validateParams(taskIdParamSchema),
  validateBody(updateTaskDeadlineSchema),
  taskController.updateTaskDeadline.bind(taskController)
);

/**
 * PATCH /api/tasks/:taskId/completion
 * Update task completion status
 */
router.patch(
  '/:taskId/completion',
  validateParams(taskIdParamSchema),
  validateBody(updateTaskCompletionSchema),
  taskController.updateTaskCompletion.bind(taskController)
);

/**
 * GET /api/tasks/:taskId/statistics
 * Get task statistics
 */
router.get(
  '/:taskId/statistics',
  validateParams(taskIdParamSchema),
  taskController.getTaskStatistics.bind(taskController)
);

export default router;
