import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 公開エンドポイント
router.post('/register', register);
router.post('/login', login);

// 認証が必要なエンドポイント
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;