import { Router } from 'express';
import practiceRoutes from './practiceRoutes';
import authRoutes from './authRoutes';
import contactRoutes from './contactRoutes';

const router = Router();

// ヘルスチェック
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// APIルート
router.use('/auth', authRoutes);
router.use('/practices', practiceRoutes);
router.use('/contacts', contactRoutes);

export default router;