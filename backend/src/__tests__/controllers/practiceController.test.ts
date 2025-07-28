import request from 'supertest';
import express from 'express';
import { getPractices, getPracticeById, createPractice } from '../../controllers/practiceController';
import { prisma } from '../../utils/prisma';
import { generateToken } from '../../utils/jwt';
import { auth } from '../../middlewares/auth';

// モックアプリケーションのセットアップ
const app = express();
app.use(express.json());

// ルート設定
app.get('/api/practices', getPractices);
app.get('/api/practices/:id', getPracticeById);
app.post('/api/admin/practices', auth, createPractice);

// エラーハンドリング
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

describe('Practice Controller', () => {
  let educator: any;
  let authToken: string;

  beforeEach(async () => {
    // テスト用教育者を作成
    educator = await prisma.educator.create({
      data: {
        email: 'educator@example.com',
        password: 'hashedpassword',
        name: 'Test Educator',
      },
    });

    authToken = generateToken({ id: educator.id, email: educator.email });
  });

  describe('GET /api/practices', () => {
    beforeEach(async () => {
      // テスト用授業実践を作成
      await prisma.practice.createMany({
        data: [
          {
            title: '算数の楽しい授業',
            description: '分数の概念を楽しく学ぶ',
            subject: '算数・数学',
            gradeLevel: '小5',
            learningLevel: 'standard',
            specialNeeds: false,
            implementationDate: new Date('2024-01-15'),
            isPublished: true,
            educatorId: educator.id,
          },
          {
            title: '国語の読解力向上',
            description: '物語文の読み方を学ぶ',
            subject: '国語',
            gradeLevel: '小4',
            learningLevel: 'basic',
            specialNeeds: true,
            implementationDate: new Date('2024-01-20'),
            isPublished: true,
            educatorId: educator.id,
          },
          {
            title: '非公開の授業',
            description: '準備中',
            subject: '理科',
            gradeLevel: '中1',
            learningLevel: 'advanced',
            specialNeeds: false,
            implementationDate: new Date('2024-01-25'),
            isPublished: false,
            educatorId: educator.id,
          },
        ],
      });
    });

    it('should return published practices with pagination', async () => {
      const response = await request(app)
        .get('/api/practices')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // 公開されている2件のみ
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter by subject', async () => {
      const response = await request(app)
        .get('/api/practices')
        .query({ subject: '算数・数学' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].subject).toBe('算数・数学');
    });

    it('should filter by special needs', async () => {
      const response = await request(app)
        .get('/api/practices')
        .query({ specialNeeds: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].specialNeeds).toBe(true);
    });

    it('should include Cache-Control header', async () => {
      const response = await request(app)
        .get('/api/practices');

      expect(response.headers['cache-control']).toBeDefined();
      expect(response.headers['cache-control']).toContain('max-age=300');
    });
  });

  describe('GET /api/practices/:id', () => {
    let practice: any;

    beforeEach(async () => {
      practice = await prisma.practice.create({
        data: {
          title: 'テスト授業',
          description: 'テスト用の授業です',
          subject: '算数・数学',
          gradeLevel: '小5',
          learningLevel: 'standard',
          implementationDate: new Date(),
          isPublished: true,
          educatorId: educator.id,
        },
      });
    });

    it('should return practice details', async () => {
      const response = await request(app)
        .get(`/api/practices/${practice.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(practice.id);
      expect(response.body.data.title).toBe(practice.title);
      expect(response.body.data.averageRating).toBeDefined();
      expect(response.body.data.ratingsCount).toBeDefined();
    });

    it('should return 404 for non-existent practice', async () => {
      const response = await request(app)
        .get('/api/practices/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should include Cache-Control for published practices', async () => {
      const response = await request(app)
        .get(`/api/practices/${practice.id}`);

      expect(response.headers['cache-control']).toBeDefined();
    });
  });

  describe('POST /api/admin/practices', () => {
    const validPracticeData = {
      title: '新しい授業実践',
      description: '革新的な教育方法',
      subject: '理科',
      gradeLevel: '中2',
      learningLevel: 'advanced',
      specialNeeds: false,
      implementationDate: '2024-02-01',
      tags: ['実験', '探究学習'],
      isPublished: false,
    };

    it('should create a new practice with authentication', async () => {
      const response = await request(app)
        .post('/api/admin/practices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPracticeData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(validPracticeData.title);
      expect(response.body.data.educatorId).toBe(educator.id);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/practices')
        .send(validPracticeData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle special needs details', async () => {
      const dataWithSpecialNeeds = {
        ...validPracticeData,
        specialNeeds: true,
        specialNeedsDetails: '視覚的な支援が必要な生徒向けの配慮',
      };

      const response = await request(app)
        .post('/api/admin/practices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dataWithSpecialNeeds);

      expect(response.status).toBe(201);
      expect(response.body.data.specialNeeds).toBe(true);
      expect(response.body.data.specialNeedsDetails).toBe(dataWithSpecialNeeds.specialNeedsDetails);
    });
  });
});