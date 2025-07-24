import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// コメント投稿
export const createComment = async (req: Request, res: Response) => {
  try {
    const { practiceId, name, content } = req.body;

    // 入力検証
    if (!practiceId || !name || !content) {
      return res.status(400).json({ message: '必須項目が入力されていません' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'コメントは1000文字以内で入力してください' });
    }

    // 授業実践の存在確認
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
    });

    if (!practice) {
      return res.status(404).json({ message: '授業実践が見つかりません' });
    }

    if (!practice.isPublished) {
      return res.status(403).json({ message: 'この授業実践にはコメントできません' });
    }

    // コメント作成
    const comment = await prisma.comment.create({
      data: {
        practiceId,
        name,
        content,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'コメントの投稿に失敗しました' });
  }
};

// 授業実践のコメント一覧取得
export const getPracticeComments = async (req: Request, res: Response) => {
  try {
    const { practiceId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { practiceId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.comment.count({
        where: { practiceId },
      }),
    ]);

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'コメントの取得に失敗しました' });
  }
};

// コメント削除（管理者のみ）
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // コメントの存在確認と権限チェック
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        practice: {
          select: {
            educatorId: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({ message: 'コメントが見つかりません' });
    }

    // 自分の授業実践へのコメントのみ削除可能
    if (comment.practice.educatorId !== userId) {
      return res.status(403).json({ message: 'このコメントを削除する権限がありません' });
    }

    await prisma.comment.delete({
      where: { id },
    });

    res.json({ message: 'コメントを削除しました' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'コメントの削除に失敗しました' });
  }
};