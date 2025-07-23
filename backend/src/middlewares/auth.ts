import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('認証トークンが提供されていません', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('認証トークンが無効です', 401));
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};