/**
 * Controller for advanced query operations
 * Handles HTTP requests for complex task queries and filtering
 */

import { Request, Response, NextFunction } from 'express';
import { QueryService } from '../services/queryService';
import { TaskService } from '../services/taskService';
import { ApiResponse, PaginatedApiResponse } from '../types/api.types';
import { TaskResponse, TaskQuery, Task } from '../types/task.types';

/**
 * Controller class for handling advanced query operations
 */
export class QueryController {
  private queryService: QueryService;
  private taskService: TaskService;

  constructor() {
    this.queryService = new QueryService();
    this.taskService = new TaskService();
  }

  /**
   * @swagger
   * /api/tasks/due-this-week:
   *   get:
   *     summary: Get tasks due this week
   *     description: Retrieve all tasks that are due within the current week across all lists
   *     tags: [Queries]
   *     responses:
   *       200:
   *         description: Tasks due this week retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TaskResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Tasks due this week retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getTasksDueThisWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId; // Get user ID from authenticated request
      const tasks = await this.taskService.getTasksDueThisWeek(userId);

      const response: ApiResponse<TaskResponse[]> = {
        data: tasks,
        success: true,
        message: 'Tasks due this week retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/overdue:
   *   get:
   *     summary: Get overdue tasks
   *     description: Retrieve all tasks that are past their deadline and not completed
   *     tags: [Queries]
   *     responses:
   *       200:
   *         description: Overdue tasks retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TaskResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Overdue tasks retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getOverdueTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId; // Get user ID from authenticated request
      const tasks = await this.taskService.getOverdueTasks(userId);

      const response: ApiResponse<TaskResponse[]> = {
        data: tasks,
        success: true,
        message: 'Overdue tasks retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/search:
   *   get:
   *     summary: Search tasks
   *     description: Search tasks by title or description
   *     tags: [Queries]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search term
   *       - in: query
   *         name: listId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Optional list ID to filter by
   *     responses:
   *       200:
   *         description: Search results retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TaskResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Search results retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async searchTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: searchTerm, listId } = req.query as { q: string; listId?: string };
      const userId = req.user!.userId; // Get user ID from authenticated request

      if (!searchTerm) {
        res.status(400).json({
          error: {
            message: 'Search term is required',
            code: 'MISSING_SEARCH_TERM'
          },
          success: false,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const tasks = await this.queryService.searchTasks(searchTerm, userId, listId);

      const response: ApiResponse<TaskResponse[]> = {
        data: tasks.map(task => this.formatTaskResponse(task)),
        success: true,
        message: 'Search results retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/statistics:
   *   get:
   *     summary: Get task statistics
   *     description: Get comprehensive statistics about tasks
   *     tags: [Queries]
   *     parameters:
   *       - in: query
   *         name: listId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Optional list ID to filter by
   *     responses:
   *       200:
   *         description: Task statistics retrieved successfully
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getTaskStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listId } = req.query as { listId?: string };
      const userId = req.user!.userId; // Get user ID from authenticated request

      const statistics = await this.queryService.getTaskStatistics(userId, listId);

      const response: ApiResponse<typeof statistics> = {
        data: statistics,
        success: true,
        message: 'Task statistics retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/grouped:
   *   get:
   *     summary: Get tasks grouped by status
   *     description: Get tasks grouped by completion status
   *     tags: [Queries]
   *     parameters:
   *       - in: query
   *         name: listId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Optional list ID to filter by
   *     responses:
   *       200:
   *         description: Grouped tasks retrieved successfully
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getTasksGrouped(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listId } = req.query as { listId?: string };
      const userId = req.user!.userId; // Get user ID from authenticated request

      const groupedTasks = await this.queryService.getTasksGroupedByStatus(userId, listId);

      const response: ApiResponse<{
        completed: TaskResponse[];
        pending: TaskResponse[];
        overdue: TaskResponse[];
        urgent: TaskResponse[];
      }> = {
        data: {
          completed: groupedTasks.completed.map(task => this.formatTaskResponse(task)),
          pending: groupedTasks.pending.map(task => this.formatTaskResponse(task)),
          overdue: groupedTasks.overdue.map(task => this.formatTaskResponse(task)),
          urgent: groupedTasks.urgent.map(task => this.formatTaskResponse(task))
        },
        success: true,
        message: 'Grouped tasks retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/productivity:
   *   get:
   *     summary: Get productivity insights
   *     description: Get productivity insights and metrics
   *     tags: [Queries]
   *     parameters:
   *       - in: query
   *         name: listId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Optional list ID to filter by
   *     responses:
   *       200:
   *         description: Productivity insights retrieved successfully
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getProductivityInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listId } = req.query as { listId?: string };
      const userId = req.user!.userId; // Get user ID from authenticated request

      const insights = await this.queryService.getProductivityInsights(userId, listId);

      const response: ApiResponse<typeof insights> = {
        data: insights,
        success: true,
        message: 'Productivity insights retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/query:
   *   get:
   *     summary: Advanced task query
   *     description: Query tasks with advanced filters, sorting, and pagination
   *     tags: [Queries]
   *     parameters:
   *       - in: query
   *         name: completed
   *         schema:
   *           type: boolean
   *         description: Filter by completion status
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [low, medium, high, urgent]
   *         description: Filter by priority
   *       - in: query
   *         name: dueBefore
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter tasks due before this date
   *       - in: query
   *         name: dueAfter
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter tasks due after this date
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, updatedAt, deadline, priority, title]
   *         description: Sort field
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Sort order
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Items per page
   *       - in: query
   *         name: listId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Optional list ID to filter by
   *     responses:
   *       200:
   *         description: Tasks retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TaskResponse'
   *                 pagination:
   *                   $ref: '#/components/schemas/PaginationResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Tasks retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async queryTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as TaskQuery;
      const { listId } = req.query as { listId?: string };
      const userId = req.user!.userId; // Get user ID from authenticated request

      const result = await this.queryService.findTasks(query, userId, listId);

      const response: PaginatedApiResponse<TaskResponse> = {
        data: result.data.map(task => this.formatTaskResponse(task)),
        pagination: result.pagination!,
        success: true,
        message: 'Tasks retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Format a Task entity to TaskResponse
   * @private
   */
  private formatTaskResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      listId: task.listId,
      title: task.title,
      ...(task.description !== undefined && { description: task.description }),
      completed: task.completed,
      ...(task.deadline && { deadline: task.deadline.toISOString() }),
      priority: task.priority,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      ...(task.completedAt && { completedAt: task.completedAt.toISOString() })
    };
  }
}
