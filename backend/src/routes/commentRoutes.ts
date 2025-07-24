import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import {
  createComment,
  getPracticeComments,
  deleteComment,
} from '../controllers/commentController';

const router = express.Router();

// コメント投稿（認証不要）
router.post('/', createComment);

// 授業実践のコメント一覧取得
router.get('/practice/:practiceId', getPracticeComments);

// コメント削除（認証必要）
router.delete('/:id', authenticateToken, deleteComment);

export default router;