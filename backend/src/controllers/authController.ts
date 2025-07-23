import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../types';

// 新規登録
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, bio, specialties } = req.body;

    // バリデーション
    if (!email || !password || !name) {
      return next(new AppError('メールアドレス、パスワード、名前は必須です', 400));
    }

    if (password.length < 8) {
      return next(new AppError('パスワードは8文字以上である必要があります', 400));
    }

    // メールアドレスの重複チェック
    const existingEducator = await prisma.educator.findUnique({
      where: { email },
    });

    if (existingEducator) {
      return next(new AppError('このメールアドレスは既に登録されています', 409));
    }

    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(password);

    // 教育者の作成
    const educator = await prisma.educator.create({
      data: {
        email,
        password: hashedPassword,
        name,
        bio: bio || '',
        specialties: specialties || [],
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        specialties: true,
        contactEnabled: true,
        createdAt: true,
      },
    });

    // JWTトークンの生成
    const token = generateToken({
      id: educator.id,
      email: educator.email,
    });

    res.status(201).json({
      success: true,
      data: {
        educator,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ログイン
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      return next(new AppError('メールアドレスとパスワードは必須です', 400));
    }

    // 教育者の検索
    const educator = await prisma.educator.findUnique({
      where: { email },
    });

    if (!educator) {
      return next(new AppError('メールアドレスまたはパスワードが正しくありません', 401));
    }

    // パスワードの検証
    const isPasswordValid = await comparePassword(password, educator.password);

    if (!isPasswordValid) {
      return next(new AppError('メールアドレスまたはパスワードが正しくありません', 401));
    }

    // JWTトークンの生成
    const token = generateToken({
      id: educator.id,
      email: educator.email,
    });

    // パスワードを除外して返す
    const { password: _, ...educatorWithoutPassword } = educator;

    res.json({
      success: true,
      data: {
        educator: educatorWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 現在のユーザー情報取得
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('認証が必要です', 401));
    }

    const educator = await prisma.educator.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        specialties: true,
        contactEnabled: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            practices: true,
          },
        },
      },
    });

    if (!educator) {
      return next(new AppError('ユーザーが見つかりません', 404));
    }

    res.json({
      success: true,
      data: educator,
    });
  } catch (error) {
    next(error);
  }
};

// プロフィール更新
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('認証が必要です', 401));
    }

    const { name, bio, specialties, contactEnabled } = req.body;

    const educator = await prisma.educator.update({
      where: { id: req.user.id },
      data: {
        name,
        bio,
        specialties,
        contactEnabled,
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        specialties: true,
        contactEnabled: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: educator,
    });
  } catch (error) {
    next(error);
  }
};