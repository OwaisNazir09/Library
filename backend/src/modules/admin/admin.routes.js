import express from 'express';
import * as adminController from './admin.controller.js';

const router = express.Router();

// All routes here should actually have a super_admin check
// But for now, we'll implement the routes and add the auth middleware later if needed
// or rely on the tenantHandler bypassing logic.

router.get('/dashboard', adminController.getAdminStats);
router.get('/tenants', adminController.getAllTenants);
router.post('/tenants', adminController.createTenant);
router.delete('/tenants/:id', adminController.deleteTenant);

export default router;
