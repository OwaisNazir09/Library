import express from 'express';
import { getPublicStats, getPublicPlans } from './public.controller.js';

const router = express.Router();

router.get('/stats', getPublicStats);
router.get('/plans', getPublicPlans);

export default router;
