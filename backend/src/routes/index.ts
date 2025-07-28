import { Router } from 'express';
import practiceRoutes from './practiceRoutes';
import authRoutes from './authRoutes';
import contactRoutes from './contactRoutes';
import uploadRoutes from './uploadRoutes';
import commentRoutes from './commentRoutes';
import ratingRoutes from './ratingRoutes';
import { securityHeaders, validateSQLParams } from '../middlewares/security';

const router = Router();

// セキュリティミドルウェアを全てのルートに適用
router.use(securityHeaders);
router.use(validateSQLParams);

// ヘルスチェック
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// APIルート
router.use('/auth', authRoutes);
router.use('/practices', practiceRoutes);
router.use('/contacts', contactRoutes);
router.use('/admin/upload', uploadRoutes);
router.use('/admin/media', uploadRoutes);
router.use('/comments', commentRoutes);
router.use('/ratings', ratingRoutes);

export default router;