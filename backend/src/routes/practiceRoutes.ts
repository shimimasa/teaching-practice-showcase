import { Router } from 'express';
import {
  getPractices,
  getPracticeById,
  createPractice,
  updatePractice,
  deletePractice,
} from '../controllers/practiceController';
import { validatePractice, validatePagination } from '../middlewares/validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 公開API
router.get('/', validatePagination, getPractices);
router.get('/:id', getPracticeById);

// 管理API（認証が必要）
router.post('/', authenticate, validatePractice, createPractice);
router.put('/:id', authenticate, validatePractice, updatePractice);
router.delete('/:id', authenticate, deletePractice);

export default router;