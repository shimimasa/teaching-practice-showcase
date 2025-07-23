import { Request } from 'express';
import { Educator } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PracticeFilters {
  subject?: string;
  gradeLevel?: string;
  learningLevel?: string;
  specialNeeds?: boolean;
  educatorId?: string;
  isPublished?: boolean;
}

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}