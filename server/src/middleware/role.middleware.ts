import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin privileges required for this action', 'ADMIN_ONLY');
  }
  next();
}

export function requireStudent(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  if (req.user.role !== 'STUDENT') {
    throw new ForbiddenError('Student privileges required for this action', 'STUDENT_ONLY');
  }
  next();
}
