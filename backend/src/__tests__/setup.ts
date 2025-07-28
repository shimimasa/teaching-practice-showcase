import { prisma } from '../utils/prisma';

// テスト環境のセットアップ
beforeAll(async () => {
  // テスト用の環境変数を設定
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_teaching_showcase';
});

// 各テスト後のクリーンアップ
afterEach(async () => {
  // トランザクションでテストデータをクリーンアップ
  const deleteComments = prisma.comment.deleteMany();
  const deleteRatings = prisma.rating.deleteMany();
  const deleteContacts = prisma.contact.deleteMany();
  const deleteMedia = prisma.media.deleteMany();
  const deletePractices = prisma.practice.deleteMany();
  const deleteEducators = prisma.educator.deleteMany();

  await prisma.$transaction([
    deleteComments,
    deleteRatings,
    deleteContacts,
    deleteMedia,
    deletePractices,
    deleteEducators,
  ]);
});

// すべてのテスト終了後
afterAll(async () => {
  await prisma.$disconnect();
});