import express from 'express';
import { signup, login } from './auth.controller.js';
import { createUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();
const upload = createUploader('users/documents');

router.post('/signup', upload.array('documents', 5), signup);
router.post('/login', login);

export default router;
