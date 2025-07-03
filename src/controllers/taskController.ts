/**
 * Controller for Task operations
 * Handles HTTP requests and responses for task-related endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { ApiResponse } from '../types/api.types';
import { CreateTaskRequest, UpdateTaskRequest, TaskResponse } from '../types/task.types';

/**
 * Controller class for handling task-related HTTP requests
 */
export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  /**
   * @swagger
   * /api/lists/{listId}/tasks:
   *   post:
   *     summary: Create a new task in a list
   *     description: Create a new task within a specific list
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The list ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTaskRequest'
   *     responses:
   *       201:
   *         description: Task created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/TaskResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Task created successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listId } = req.params as { listId: string };
      const createData: CreateTaskRequest = req.body;

      const task = await this.taskService.createTask(listId, createData);

      const response: ApiResponse<TaskResponse> = {
        data: task,
        success: true,
        message: 'Task created successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{taskId}:
   *   get:
   *     summary: Get a specific task
   *     description: Retrieve a task by its ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The task ID
   *     responses:
   *       200:
   *         description: Task retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/TaskResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Task retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params as { taskId: string };

      const task = await this.taskService.getTaskById(taskId);

      const response: ApiResponse<TaskResponse> = {
        data: task,
        success: true,
        message: 'Task retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{taskId}:
   *   put:
   *     summary: Update a task
   *     description: Update an existing task by its ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateTaskRequest'
   *     responses:
   *       200:
   *         description: Task updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/TaskResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Task updated successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params as { taskId: string };
      const updateData: UpdateTaskRequest = req.body;

      const task = await this.taskService.updateTask(taskId, updateData);

      const response: ApiResponse<TaskResponse> = {
        data: task,
        success: true,
        message: 'Task updated successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{taskId}:
   *   delete:
   *     summary: Delete a task
   *     description: Delete a task by its ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The task ID
   *     responses:
   *       200:
   *         description: Task deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     deleted:
   *                       type: boolean
   *                       example: true
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Task deleted successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params as { taskId: string };

      const deleted = await this.taskService.deleteTask(taskId);

      const response: ApiResponse<{ deleted: boolean }> = {
        data: { deleted },
        success: true,
        message: 'Task deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{taskId}/deadline:
   *   patch:
   *     summary: Update task deadline
   *     description: Update the deadline of a specific task
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               deadline:
   *                 type: string
   *                 format: date-time
   *                 description: The new deadline (ISO string)
   *             required:
   *               - deadline
   *     responses:
   *       200:
   *         description: Task deadline updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/TaskResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Task deadline updated successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async updateTaskDeadline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params as { taskId: string };
      const { deadline } = req.body as { deadline: string };

      const task = await this.taskService.updateTaskDeadline(taskId, deadline);

      const response: ApiResponse<TaskResponse> = {
        data: task,
        success: true,
        message: 'Task deadline updated successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{taskId}/completion:
   *   patch:
   *     summary: Update task completion status
   *     description: Mark a task as completed or incomplete
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               completed:
   *                 type: boolean
   *                 description: Whether the task is completed
   *             required:
   *               - completed
   *     responses:
   *       200:
   *         description: Task completion status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/TaskResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Task completion status updated successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async updateTaskCompletion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params as { taskId: string };
      const { completed } = req.body as { completed: boolean };

      const task = await this.taskService.updateTaskCompletion(taskId, completed);

      const response: ApiResponse<TaskResponse> = {
        data: task,
        success: true,
        message: 'Task completion status updated successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/tasks/{taskId}/statistics:
   *   get:
   *     summary: Get task statistics
   *     description: Get detailed statistics for a specific task
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The task ID
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
   *                     taskId:
   *                       type: string
   *                       format: uuid
   *                     title:
   *                       type: string
   *                     status:
   *                       type: string
   *                       enum: [completed, pending]
   *                     priority:
   *                       type: string
   *                       enum: [low, medium, high, urgent]
   *                     createdDaysAgo:
   *                       type: integer
   *                     hasDeadline:
   *                       type: boolean
   *                     isOverdue:
   *                       type: boolean
   *                     isUrgent:
   *                       type: boolean
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Task statistics retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getTaskStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params as { taskId: string };

      const statistics = await this.taskService.getTaskStatistics(taskId);

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
}
