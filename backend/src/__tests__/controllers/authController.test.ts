import request from 'supertest';
import express from 'express';
import { register, login } from '../../controllers/authController';
import { prisma } from '../../utils/prisma';
import { hashPassword } from '../../utils/password';

// モックアプリケーションのセットアップ
const app = express();
app.use(express.json());
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// エラーハンドリングミドルウェア
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.name).toBe(validUserData.name);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail with duplicate email', async () => {
      // 最初のユーザーを作成
      await prisma.educator.create({
        data: {
          email: validUserData.email,
          password: await hashPassword(validUserData.password),
          name: validUserData.name,
        },
      });

      // 同じメールで登録を試みる
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('既に登録されています');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // passwordとnameが欠落
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // テスト用ユーザーを作成
      await prisma.educator.create({
        data: {
          email: 'test@example.com',
          password: await hashPassword('Password123!'),
          name: 'Test User',
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('無効です');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('無効です');
    });
  });
});