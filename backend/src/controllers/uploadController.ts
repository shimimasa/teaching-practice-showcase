import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// ファイルアップロード
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'ファイルがアップロードされていません' });
    }

    const { practiceId } = req.body;
    const file = req.file;

    // ファイル情報をデータベースに保存
    const media = await prisma.media.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        ...(practiceId && { practiceId }),
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'ファイルのアップロードに失敗しました' });
  }
};

// ファイル削除
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // ファイル情報を取得
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        practice: {
          select: {
            educatorId: true,
          },
        },
      },
    });

    if (!media) {
      return res.status(404).json({ message: 'ファイルが見つかりません' });
    }

    // 権限チェック（ファイルが授業実践に紐づいている場合）
    if (media.practice && media.practice.educatorId !== userId) {
      return res.status(403).json({ message: 'このファイルを削除する権限がありません' });
    }

    // ファイルを物理的に削除
    const filePath = path.join(process.cwd(), 'uploads', media.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('File deletion error:', error);
      // ファイルが存在しない場合もエラーにしない
    }

    // データベースから削除
    await prisma.media.delete({
      where: { id },
    });

    res.status(200).json({ message: 'ファイルを削除しました' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'ファイルの削除に失敗しました' });
  }
};

// 授業実践のメディア一覧取得
export const getPracticeMedia = async (req: Request, res: Response) => {
  try {
    const { practiceId } = req.params;

    const media = await prisma.media.findMany({
      where: { practiceId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(media);
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ message: 'メディア一覧の取得に失敗しました' });
  }
};