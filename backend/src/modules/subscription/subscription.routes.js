import express from 'express';
import * as subscriptionController from './subscription.controller.js';

const router = express.Router();

router.get('/', subscriptionController.getAllPlans);
router.post('/', subscriptionController.createPlan);
router.put('/:id', subscriptionController.updatePlan);
router.delete('/:id', subscriptionController.deletePlan);

router.post('/assign', subscriptionController.assignPlanToLibrary);
router.get('/analytics', subscriptionController.getSubscriptionAnalytics);

export default router;
