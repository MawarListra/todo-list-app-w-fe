/**
 * Authentication middleware for protecting API routes
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../services/authService.js';
import { JwtPayload } from '../types/user.types.js';

/**
 * Extend Express Request interface to include user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message:
          'No token provided. Please include a valid Bearer token in the Authorization header.',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    let message = 'Invalid token';
    let code = 'INVALID_TOKEN';

    if (error instanceof Error) {
      message = error.message;
      if (error.message.includes('expired')) {
        code = 'TOKEN_EXPIRED';
      } else if (error.message.includes('Invalid')) {
        code = 'INVALID_TOKEN';
      }
    }

    res.status(401).json({
      error: 'Authentication failed',
      message,
      code
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user data if token is provided, but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // For optional auth, we don't send an error response
    // Just continue without user data
    next();
  }
};

/**
 * Middleware to check if user is authenticated
 * Returns user info or 401 if not authenticated
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource.',
      code: 'AUTHENTICATION_REQUIRED'
    });
    return;
  }
  next();
};

/**
 * Middleware to check if the authenticated user owns the resource
 * Used for user-specific resources like lists and tasks
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource.',
        code: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    const resourceUserId = req.params[userIdParam];

    if (req.user.userId !== resourceUserId) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to extract user ID from authenticated user
 * Adds userId to request params for convenience
 */
export const injectUserId = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user) {
    req.params.userId = req.user.userId;
  }
  next();
};
