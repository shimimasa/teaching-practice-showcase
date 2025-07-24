import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 評価投稿
export const createRating = async (req: Request, res: Response) => {
  try {
    const { practiceId, value } = req.body;
    const sessionId = req.body.sessionId || req.ip; // セッションIDまたはIPアドレスで重複チェック

    // 入力検証
    if (!practiceId || !value) {
      return res.status(400).json({ message: '必須項目が入力されていません' });
    }

    if (value < 1 || value > 5) {
      return res.status(400).json({ message: '評価は1から5の間で入力してください' });
    }

    // 授業実践の存在確認
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
    });

    if (!practice) {
      return res.status(404).json({ message: '授業実践が見つかりません' });
    }

    if (!practice.isPublished) {
      return res.status(403).json({ message: 'この授業実践には評価できません' });
    }

    // 既存の評価をチェック（同一セッション/IPからの重複評価を防ぐ）
    const existingRating = await prisma.rating.findFirst({
      where: {
        practiceId,
        sessionId,
      },
    });

    if (existingRating) {
      // 既存の評価を更新
      const updatedRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { value },
      });
      return res.json(updatedRating);
    }

    // 新規評価作成
    const rating = await prisma.rating.create({
      data: {
        practiceId,
        value,
        sessionId,
      },
    });

    res.status(201).json(rating);
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: '評価の投稿に失敗しました' });
  }
};

// 授業実践の評価統計取得
export const getPracticeRatingStats = async (req: Request, res: Response) => {
  try {
    const { practiceId } = req.params;

    // 評価の集計
    const ratings = await prisma.rating.findMany({
      where: { practiceId },
      select: { value: true },
    });

    if (ratings.length === 0) {
      return res.json({
        average: 0,
        total: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      });
    }

    // 平均値計算
    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    const average = sum / ratings.length;

    // 分布計算
    const distribution = ratings.reduce((acc, rating) => {
      acc[rating.value] = (acc[rating.value] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // 1-5の全ての値を確保
    for (let i = 1; i <= 5; i++) {
      if (!distribution[i]) {
        distribution[i] = 0;
      }
    }

    res.json({
      average: Math.round(average * 10) / 10, // 小数点1位まで
      total: ratings.length,
      distribution,
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({ message: '評価統計の取得に失敗しました' });
  }
};

// ユーザーの評価取得
export const getUserRating = async (req: Request, res: Response) => {
  try {
    const { practiceId } = req.params;
    const sessionId = req.query.sessionId || req.ip;

    const rating = await prisma.rating.findFirst({
      where: {
        practiceId,
        sessionId: sessionId as string,
      },
    });

    res.json({ rating: rating?.value || null });
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ message: 'ユーザー評価の取得に失敗しました' });
  }
};