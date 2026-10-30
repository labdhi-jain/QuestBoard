import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UnauthorizedError } from '../utils/errors';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  lifetimePoints: number;
  pointsBalance: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/, '');

  if (!token) {
    throw new UnauthorizedError('Please log in to continue', 'AUTH_REQUIRED');
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    throw new UnauthorizedError('Session expired or invalid. Please log in again.', 'TOKEN_INVALID');
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/, '');
  if (token) {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthUser;
      req.user = decoded;
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}
