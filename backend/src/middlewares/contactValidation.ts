import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateContact = (req: Request, res: Response, next: NextFunction) => {
  const { practiceId, parentName, parentEmail, childAge, message } = req.body;

  if (!practiceId || practiceId.trim().length === 0) {
    return next(new AppError('授業実践IDは必須です', 400));
  }

  if (!parentName || parentName.trim().length === 0) {
    return next(new AppError('保護者の名前は必須です', 400));
  }

  if (!parentEmail || parentEmail.trim().length === 0) {
    return next(new AppError('メールアドレスは必須です', 400));
  }

  // 簡易的なメールアドレス検証
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(parentEmail)) {
    return next(new AppError('有効なメールアドレスを入力してください', 400));
  }

  if (!childAge || isNaN(childAge) || childAge < 6 || childAge > 15) {
    return next(new AppError('お子様の年齢は6歳から15歳の間で入力してください', 400));
  }

  if (!message || message.trim().length === 0) {
    return next(new AppError('メッセージは必須です', 400));
  }

  if (message.length > 2000) {
    return next(new AppError('メッセージは2000文字以内で入力してください', 400));
  }

  next();
};