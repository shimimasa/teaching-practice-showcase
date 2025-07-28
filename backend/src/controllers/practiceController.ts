import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest, PracticeFilters } from '../types';

// 授業実践一覧取得
export const getPractices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // フィルタ条件の構築
    const where: PracticeFilters = {
      isPublished: true,
    };

    if (req.query.subject) where.subject = req.query.subject as string;
    if (req.query.gradeLevel) where.gradeLevel = req.query.gradeLevel as string;
    if (req.query.learningLevel) where.learningLevel = req.query.learningLevel as string;
    if (req.query.specialNeeds) where.specialNeeds = req.query.specialNeeds === 'true';

    // データ取得
    const [practices, total] = await Promise.all([
      prisma.practice.findMany({
        where,
        skip,
        take: limit,
        include: {
          educator: {
            select: {
              id: true,
              name: true,
              specialties: true,
            },
          },
          materials: true,
          _count: {
            select: {
              comments: true,
              ratings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.practice.count({ where }),
    ]);

    // キャッシュヘッダーを設定（公開データなので5分間キャッシュ）
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    
    res.json({
      success: true,
      data: practices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 授業実践個別取得
export const getPracticeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const practice = await prisma.practice.findUnique({
      where: { id },
      include: {
        educator: {
          select: {
            id: true,
            name: true,
            bio: true,
            specialties: true,
            contactEnabled: true,
          },
        },
        materials: true,
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        ratings: true,
      },
    });

    if (!practice) {
      return next(new AppError('授業実践が見つかりません', 404));
    }

    // 非公開の場合は作成者のみアクセス可能
    const authReq = req as AuthRequest;
    if (!practice.isPublished && (!authReq.user || authReq.user.id !== practice.educatorId)) {
      return next(new AppError('この授業実践にはアクセスできません', 403));
    }

    // 平均評価を計算
    const averageRating = practice.ratings.length > 0
      ? practice.ratings.reduce((sum, r) => sum + r.score, 0) / practice.ratings.length
      : 0;

    // 公開されている授業実践は5分間キャッシュ
    if (practice.isPublished) {
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    }
    
    res.json({
      success: true,
      data: {
        ...practice,
        averageRating,
        ratingsCount: practice.ratings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 授業実践作成（認証必要）
export const createPractice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('認証が必要です', 401));
    }

    const {
      title,
      description,
      subject,
      gradeLevel,
      learningLevel,
      specialNeeds,
      specialNeedsDetails,
      implementationDate,
      tags,
      isPublished,
    } = req.body;

    const practice = await prisma.practice.create({
      data: {
        title,
        description,
        subject,
        gradeLevel,
        learningLevel,
        specialNeeds: specialNeeds || false,
        specialNeedsDetails: specialNeeds ? specialNeedsDetails : null,
        implementationDate: new Date(implementationDate),
        tags: tags || [],
        isPublished: isPublished || false,
        educatorId: req.user.id,
      },
      include: {
        educator: {
          select: {
            id: true,
            name: true,
            specialties: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: practice,
    });
  } catch (error) {
    next(error);
  }
};

// 授業実践更新（認証必要）
export const updatePractice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('認証が必要です', 401));
    }

    const { id } = req.params;

    // 既存の授業実践を確認
    const existingPractice = await prisma.practice.findUnique({
      where: { id },
    });

    if (!existingPractice) {
      return next(new AppError('授業実践が見つかりません', 404));
    }

    if (existingPractice.educatorId !== req.user.id) {
      return next(new AppError('この授業実践を編集する権限がありません', 403));
    }

    const practice = await prisma.practice.update({
      where: { id },
      data: {
        ...req.body,
        implementationDate: req.body.implementationDate 
          ? new Date(req.body.implementationDate) 
          : undefined,
      },
      include: {
        educator: {
          select: {
            id: true,
            name: true,
            specialties: true,
          },
        },
        materials: true,
      },
    });

    res.json({
      success: true,
      data: practice,
    });
  } catch (error) {
    next(error);
  }
};

// 授業実践削除（認証必要）
export const deletePractice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('認証が必要です', 401));
    }

    const { id } = req.params;

    // 既存の授業実践を確認
    const existingPractice = await prisma.practice.findUnique({
      where: { id },
    });

    if (!existingPractice) {
      return next(new AppError('授業実践が見つかりません', 404));
    }

    if (existingPractice.educatorId !== req.user.id) {
      return next(new AppError('この授業実践を削除する権限がありません', 403));
    }

    await prisma.practice.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: '授業実践を削除しました',
    });
  } catch (error) {
    next(error);
  }
};