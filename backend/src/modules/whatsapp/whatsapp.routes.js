import express from 'express';
import { initializeWhatsApp, getWhatsAppStatus, logoutWhatsApp, getWhatsAppLogs } from './whatsapp.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('librarian'));

router.post('/init', initializeWhatsApp);
router.get('/status', getWhatsAppStatus);
router.get('/logs', getWhatsAppLogs);
router.post('/logout', logoutWhatsApp);

export default router;

