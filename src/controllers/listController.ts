/**
 * Controller for List operations
 * Handles HTTP requests and responses for list-related endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ListService } from '../services/listService';
import { ApiResponse } from '../types/api.types';
import {
  CreateListRequest,
  UpdateListRequest,
  ListResponse,
  ListWithTasks
} from '../types/list.types';

/**
 * Controller class for handling list-related HTTP requests
 */
export class ListController {
  private listService: ListService;

  constructor() {
    this.listService = new ListService();
  }

  /**
   * @swagger
   * /api/lists:
   *   get:
   *     summary: Get all lists
   *     description: Retrieve all lists with optional task count
   *     tags: [Lists]
   *     parameters:
   *       - in: query
   *         name: includeTaskCount
   *         schema:
   *           type: boolean
   *           default: true
   *         description: Whether to include task count for each list
   *     responses:
   *       200:
   *         description: Successfully retrieved lists
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ListResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Lists retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getAllLists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeTaskCount = req.query.includeTaskCount !== 'false';
      const userId = req.user!.userId; // Get user ID from authenticated request

      const lists = await this.listService.getAllLists(userId, includeTaskCount);

      const response: ApiResponse<ListResponse[]> = {
        data: lists,
        success: true,
        message: 'Lists retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/lists:
   *   post:
   *     summary: Create a new list
   *     description: Create a new todo list
   *     tags: [Lists]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateListRequest'
   *     responses:
   *       201:
   *         description: List created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/ListResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: List created successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async createList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createData: CreateListRequest = req.body;
      const userId = req.user!.userId; // Get user ID from authenticated request

      const list = await this.listService.createList(createData, userId);

      const response: ApiResponse<ListResponse> = {
        data: list,
        success: true,
        message: 'List created successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/lists/{listId}:
   *   get:
   *     summary: Get a specific list
   *     description: Retrieve a list by its ID with optional task count
   *     tags: [Lists]
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The list ID
   *       - in: query
   *         name: includeTaskCount
   *         schema:
   *           type: boolean
   *           default: true
   *         description: Whether to include task count
   *     responses:
   *       200:
   *         description: List retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/ListResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: List retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getListById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listId } = req.params as { listId: string };
      const includeTaskCount = req.query.includeTaskCount !== 'false';
      const userId = req.user!.userId; // Get user ID from authenticated request

      const list = await this.listService.getListById(listId, userId, includeTaskCount);

      const response: ApiResponse<ListResponse> = {
        data: list,
        success: true,
        message: 'List retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/lists/{listId}/tasks:
   *   get:
   *     summary: Get a list with its tasks
   *     description: Retrieve a list with all associated tasks
   *     tags: [Lists]
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The list ID
   *     responses:
   *       200:
   *         description: List with tasks retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/ListWithTasks'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: List with tasks retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getListWithTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listId } = req.params as { listId: string };
      const userId = req.user!.userId; // Get user ID from authenticated request

      const listWithTasks = await this.listService.getListWithTasks(listId, userId);

      const response: ApiResponse<ListWithTasks> = {
        data: listWithTasks,
        success: true,
        message: 'List with tasks retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/lists/{listId}:
   *   put:
   *     summary: Update a list
   *     description: Update an existing list by its ID
   *     tags: [Lists]
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
   *             $ref: '#/components/schemas/UpdateListRequest'
   *     responses:
   *       200:
   *         description: List updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/ListResponse'
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: List updated successfully
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
  async updateList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listId } = req.params as { listId: string };
      const updateData: UpdateListRequest = req.body;
      const userId = req.user!.userId; // Get user ID from authenticated request

      const list = await this.listService.updateList(listId, userId, updateData);

      const response: ApiResponse<ListResponse> = {
        data: list,
        success: true,
        message: 'List updated successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/lists/{listId}:
   *   delete:
   *     summary: Delete a list
   *     description: Delete a list and all its associated tasks
   *     tags: [Lists]
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The list ID
   *     responses:
   *       200:
   *         description: List deleted successfully
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
   *                   example: List deleted successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async deleteList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listId } = req.params as { listId: string };
      const userId = req.user!.userId; // Get user ID from authenticated request

      const deleted = await this.listService.deleteList(listId, userId);

      const response: ApiResponse<{ deleted: boolean }> = {
        data: { deleted },
        success: true,
        message: 'List deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/lists/{listId}/statistics:
   *   get:
   *     summary: Get list statistics
   *     description: Get statistics for a specific list including task counts and completion rates
   *     tags: [Lists]
   *     parameters:
   *       - in: path
   *         name: listId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The list ID
   *     responses:
   *       200:
   *         description: List statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     listId:
   *                       type: string
   *                       format: uuid
   *                     listName:
   *                       type: string
   *                     totalTasks:
   *                       type: integer
   *                     completedTasks:
   *                       type: integer
   *                     pendingTasks:
   *                       type: integer
   *                     overdueTasks:
   *                       type: integer
   *                     completionRate:
   *                       type: number
   *                       format: float
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: List statistics retrieved successfully
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getListStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { listId } = req.params as { listId: string };
      const userId = req.user!.userId; // Get user ID from authenticated request

      const statistics = await this.listService.getListStatistics(listId, userId);

      const response: ApiResponse<typeof statistics> = {
        data: statistics,
        success: true,
        message: 'List statistics retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
