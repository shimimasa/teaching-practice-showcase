import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import {
  uploadFile,
  deleteFile,
  getPracticeMedia,
} from '../controllers/uploadController';

const router = express.Router();

// ファイルアップロード（認証必要）
router.post('/', authenticateToken, upload.single('file'), uploadFile);

// ファイル削除（認証必要）
router.delete('/:id', authenticateToken, deleteFile);

// 授業実践のメディア一覧取得
router.get('/practice/:practiceId', getPracticeMedia);

export default router;