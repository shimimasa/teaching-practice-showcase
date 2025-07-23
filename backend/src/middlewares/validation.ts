import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validatePractice = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, subject, gradeLevel, learningLevel } = req.body;

  if (!title || title.trim().length === 0) {
    return next(new AppError('タイトルは必須です', 400));
  }

  if (!description || description.trim().length === 0) {
    return next(new AppError('説明は必須です', 400));
  }

  if (!subject || subject.trim().length === 0) {
    return next(new AppError('科目は必須です', 400));
  }

  if (!gradeLevel || gradeLevel.trim().length === 0) {
    return next(new AppError('学年は必須です', 400));
  }

  const validGradeLevels = [
    '小1', '小2', '小3', '小4', '小5', '小6',
    '中1', '中2', '中3'
  ];
  if (!validGradeLevels.includes(gradeLevel)) {
    return next(new AppError('無効な学年です', 400));
  }

  if (!learningLevel || !['basic', 'standard', 'advanced'].includes(learningLevel)) {
    return next(new AppError('学習レベルは basic, standard, advanced のいずれかである必要があります', 400));
  }

  next();
};

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.query;

  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    return next(new AppError('ページ番号は1以上の数値である必要があります', 400));
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return next(new AppError('表示件数は1から100の間である必要があります', 400));
  }

  next();
};