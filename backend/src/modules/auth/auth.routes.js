import express from 'express';
import { signup, login, updatePassword } from './auth.controller.js';
import { createUploader } from '../../middleware/upload.middleware.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();
const upload = createUploader('users/documents');

router.post('/signup', upload.array('documents', 5), signup);
router.post('/login', login);

router.use(protect);
router.patch('/update-password', updatePassword);

export default router;
