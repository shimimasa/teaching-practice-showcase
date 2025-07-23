import { Router } from 'express';
import {
  createContact,
  getContacts,
  getContactById,
  updateContactStatus,
} from '../controllers/contactController';
import { validateContact } from '../middlewares/contactValidation';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 公開API
router.post('/', validateContact, createContact);

// 管理API（認証必要）
router.get('/', authenticate, getContacts);
router.get('/:id', authenticate, getContactById);
router.put('/:id/status', authenticate, updateContactStatus);

export default router;