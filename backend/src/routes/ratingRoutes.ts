import express from 'express';
import {
  createRating,
  getPracticeRatingStats,
  getUserRating,
} from '../controllers/ratingController';

const router = express.Router();

// 評価投稿（認証不要）
router.post('/', createRating);

// 授業実践の評価統計取得
router.get('/practice/:practiceId/stats', getPracticeRatingStats);

// ユーザーの評価取得
router.get('/practice/:practiceId/user', getUserRating);

export default router;