import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendNewContactNotification } from '../utils/email';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../types';

// 連絡フォーム送信
export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { practiceId, parentName, parentEmail, childAge, message } = req.body;

    // 授業実践の存在確認と教育者情報の取得
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
      include: {
        educator: true,
      },
    });

    if (!practice) {
      return next(new AppError('指定された授業実践が見つかりません', 404));
    }

    if (!practice.isPublished) {
      return next(new AppError('この授業実践は公開されていません', 403));
    }

    if (!practice.educator.contactEnabled) {
      return next(new AppError('この教育者は現在連絡を受け付けていません', 403));
    }

    // 連絡を保存
    const contact = await prisma.contact.create({
      data: {
        practiceId,
        parentName,
        parentEmail,
        childAge,
        message,
      },
    });

    // 教育者にメール通知
    try {
      await sendNewContactNotification(
        practice.educator.email,
        practice.educator.name,
        practice.title,
        parentName,
        message
      );
    } catch (error) {
      // メール送信に失敗しても、連絡は保存されているのでエラーにしない
      console.error('Failed to send email notification:', error);
    }

    res.status(201).json({
      success: true,
      message: '連絡を送信しました。教育者から返信があるまでお待ちください。',
      data: {
        id: contact.id,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 連絡一覧取得（認証必要）
export const getContacts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('認証が必要です', 401));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    // フィルタ条件の構築
    const where: any = {
      practice: {
        educatorId: req.user.id,
      },
    };

    if (status && ['new', 'replied', 'closed'].includes(status)) {
      where.status = status;
    }

    // データ取得
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        include: {
          practice: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      success: true,
      data: contacts,
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

// 連絡詳細取得（認証必要）
export const getContactById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('認証が必要です', 401));
    }

    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        practice: {
          include: {
            educator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!contact) {
      return next(new AppError('連絡が見つかりません', 404));
    }

    // 自分の授業実践への連絡かチェック
    if (contact.practice.educatorId !== req.user.id) {
      return next(new AppError('この連絡にアクセスする権限がありません', 403));
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// 連絡ステータス更新（認証必要）
export const updateContactStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('認証が必要です', 401));
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'replied', 'closed'].includes(status)) {
      return next(new AppError('無効なステータスです', 400));
    }

    // 連絡の存在確認と権限チェック
    const existingContact = await prisma.contact.findUnique({
      where: { id },
      include: {
        practice: true,
      },
    });

    if (!existingContact) {
      return next(new AppError('連絡が見つかりません', 404));
    }

    if (existingContact.practice.educatorId !== req.user.id) {
      return next(new AppError('この連絡を更新する権限がありません', 403));
    }

    // ステータス更新
    const contact = await prisma.contact.update({
      where: { id },
      data: { status },
    });

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};