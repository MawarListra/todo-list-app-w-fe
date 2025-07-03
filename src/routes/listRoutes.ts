/**
 * Routes for List operations
 */

import { Router } from 'express';
import { ListController } from '../controllers/listController';
import { validateBody, validateParams, validateOptionalQuery } from '../middleware/validation';
import { createListSchema, updateListSchema, uuidParamSchema } from '../schemas/validation.schemas';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const listController = new ListController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Lists
 *   description: Todo list management operations
 */

/**
 * GET /api/lists
 * Get all lists
 */
router.get('/', listController.getAllLists.bind(listController));

/**
 * POST /api/lists
 * Create a new list
 */
router.post('/', validateBody(createListSchema), listController.createList.bind(listController));

/**
 * GET /api/lists/:listId
 * Get a specific list by ID
 */
router.get(
  '/:listId',
  validateParams(uuidParamSchema),
  listController.getListById.bind(listController)
);

/**
 * PUT /api/lists/:listId
 * Update a list
 */
router.put(
  '/:listId',
  validateParams(uuidParamSchema),
  validateBody(updateListSchema),
  listController.updateList.bind(listController)
);

/**
 * DELETE /api/lists/:listId
 * Delete a list
 */
router.delete(
  '/:listId',
  validateParams(uuidParamSchema),
  listController.deleteList.bind(listController)
);

/**
 * GET /api/lists/:listId/tasks
 * Get a list with all its tasks
 */
router.get(
  '/:listId/tasks',
  validateParams(uuidParamSchema),
  listController.getListWithTasks.bind(listController)
);

/**
 * GET /api/lists/:listId/statistics
 * Get statistics for a specific list
 */
router.get(
  '/:listId/statistics',
  validateParams(uuidParamSchema),
  listController.getListStatistics.bind(listController)
);

export default router;
