import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  id: string;
  email: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('トークンの有効期限が切れています', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('無効なトークンです', 401);
    }
    throw new AppError('トークンの検証に失敗しました', 401);
  }
};