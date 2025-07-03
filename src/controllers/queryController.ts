/**
 * Controller for advanced query operations
 * Handles HTTP requests for complex task queries and filtering
 */

import { Request, Response, NextFunction } from 'express';
import { QueryService } from '../services/queryService';
import { TaskService } from '../services/taskService';
import { ApiResponse, PaginatedApiResponse } from '../types/api.types';
import { TaskResponse, TaskQuery } from '../types/task.types';

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
      const tasks = await this.taskService.getTasksDueThisWeek();

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
   * /api/tasks:
   *   get:
   *     summary: Query tasks with filtering and sorting
   *     description: Search and filter tasks across all lists with pagination support
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
   *         description: Filter by priority level
   *       - in: query
   *         name: dueBefore
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter tasks due before this date (ISO string)
   *       - in: query
   *         name: dueAfter
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter tasks due after this date (ISO string)
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, updatedAt, deadline, priority, title]
   *           default: createdAt
   *         description: Field to sort by
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Sort order
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of items per page
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
      const result = await this.queryService.findTasks(query);

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
      const tasks = await this.queryService.getOverdueTasks();

      const response: ApiResponse<TaskResponse[]> = {
        data: tasks.map(task => this.formatTaskResponse(task)),
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
   * /api/tasks/statistics:
   *   get:
   *     summary: Get overall task statistics
   *     description: Retrieve comprehensive statistics for all tasks across all lists
   *     tags: [Queries]
   *     responses:
   *       200:
   *         description: Task statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     completed:
   *                       type: integer
   *                     pending:
   *                       type: integer
   *                     overdue:
   *                       type: integer
   *                     dueToday:
   *                       type: integer
   *                     completionRate:
   *                       type: number
   *                       format: float
   *                     priorityBreakdown:
   *                       type: object
   *                     averageCompletionTime:
   *                       type: number
   *                       format: float
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Task statistics retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getTaskStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await this.queryService.getTaskStatistics();

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
   *     description: Retrieve tasks organized by completion status, deadline status, and priority
   *     tags: [Queries]
   *     responses:
   *       200:
   *         description: Grouped tasks retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     byCompletion:
   *                       type: object
   *                       properties:
   *                         completed:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/TaskResponse'
   *                         pending:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/TaskResponse'
   *                     byDeadline:
   *                       type: object
   *                     byPriority:
   *                       type: object
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Grouped tasks retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getTasksGrouped(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const groupedTasks = await this.queryService.getTasksGroupedByStatus();

      // Format all tasks in the grouped structure
      const formattedGroupedTasks = {
        byCompletion: {
          completed: groupedTasks.byCompletion.completed.map(task => this.formatTaskResponse(task)),
          pending: groupedTasks.byCompletion.pending.map(task => this.formatTaskResponse(task))
        },
        byDeadline: {
          overdue: groupedTasks.byDeadline.overdue.map(task => this.formatTaskResponse(task)),
          today: groupedTasks.byDeadline.today.map(task => this.formatTaskResponse(task)),
          tomorrow: groupedTasks.byDeadline.tomorrow.map(task => this.formatTaskResponse(task)),
          thisWeek: groupedTasks.byDeadline.thisWeek.map(task => this.formatTaskResponse(task)),
          later: groupedTasks.byDeadline.later.map(task => this.formatTaskResponse(task)),
          noDeadline: groupedTasks.byDeadline.noDeadline.map(task => this.formatTaskResponse(task))
        },
        byPriority: {
          urgent: groupedTasks.byPriority.urgent.map(task => this.formatTaskResponse(task)),
          high: groupedTasks.byPriority.high.map(task => this.formatTaskResponse(task)),
          medium: groupedTasks.byPriority.medium.map(task => this.formatTaskResponse(task)),
          low: groupedTasks.byPriority.low.map(task => this.formatTaskResponse(task))
        }
      };

      const response: ApiResponse<typeof formattedGroupedTasks> = {
        data: formattedGroupedTasks,
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
   * /api/insights/productivity:
   *   get:
   *     summary: Get productivity insights
   *     description: Retrieve productivity analytics and insights across all tasks
   *     tags: [Queries]
   *     responses:
   *       200:
   *         description: Productivity insights retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     tasksCreatedThisWeek:
   *                       type: integer
   *                     tasksCompletedThisWeek:
   *                       type: integer
   *                     tasksCompletedThisMonth:
   *                       type: integer
   *                     weeklyCompletionRate:
   *                       type: number
   *                       format: float
   *                     averageTasksPerDay:
   *                       type: number
   *                       format: float
   *                     mostProductiveDay:
   *                       type: string
   *                     taskCompletionTrend:
   *                       type: string
   *                       enum: [improving, declining, stable]
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Productivity insights retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getProductivityInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await this.queryService.getProductivityInsights();

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
   * Format a Task entity to TaskResponse
   * @private
   */
  private formatTaskResponse(task: any): TaskResponse {
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
