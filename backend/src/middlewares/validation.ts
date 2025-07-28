import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import validator from 'validator';

// XSS対策用のサニタイズ関数
function sanitizeInput(input: string): string {
  return validator.escape(input.trim());
}

export const validatePractice = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, subject, gradeLevel, learningLevel } = req.body;

  if (!title || title.trim().length === 0) {
    return next(new AppError('タイトルは必須です', 400));
  }

  if (!description || description.trim().length === 0) {
    return next(new AppError('説明は必須です', 400));
  }

  // 入力値のサニタイズ
  req.body.title = sanitizeInput(title);
  req.body.description = sanitizeInput(description);
  req.body.subject = sanitizeInput(subject);
  req.body.gradeLevel = sanitizeInput(gradeLevel);

  // 文字数制限の確認
  if (title.length > 100) {
    return next(new AppError('タイトルは100文字以内で入力してください', 400));
  }

  if (description.length > 5000) {
    return next(new AppError('説明は5000文字以内で入力してください', 400));
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

  // 特別配慮詳細のサニタイズ（存在する場合）
  if (req.body.specialNeedsDetails) {
    req.body.specialNeedsDetails = sanitizeInput(req.body.specialNeedsDetails);
    
    if (req.body.specialNeedsDetails.length > 1000) {
      return next(new AppError('特別配慮の詳細は1000文字以内で入力してください', 400));
    }
  }

  next();
};

// 汎用的な入力検証ミドルウェア
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  // リクエストボディの全ての文字列フィールドをサニタイズ
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeInput(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
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