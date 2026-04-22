import express from 'express';
import subscriptionRoutes from '../subscription/subscription.routes.js';
import * as subscriptionController from '../subscription/subscription.controller.js';
import * as adminController from './admin.controller.js';
import * as platformLedgerController from '../platformLedger/platformLedger.controller.js';
const router = express.Router();

router.use('/packages', subscriptionRoutes);
router.post('/assign-package', subscriptionController.assignPlanToLibrary);
router.get('/dashboard', adminController.getAdminStats);

router.get('/libraries', adminController.getAllTenants);
router.post('/libraries', adminController.createTenant);
router.patch('/libraries/:id', adminController.updateTenant);
router.delete('/libraries/:id', adminController.deleteTenant);
router.get('/libraries/:id/analytics', adminController.getLibraryAnalytics);

router.get('/users', adminController.getAllGlobalUsers);
router.patch('/users/:id', adminController.updateGlobalUser);

router.get('/queries', adminController.getAllQueries);
router.patch('/queries/:id', adminController.updateQuery);

router.get('/tenants', adminController.getAllTenants);
router.post('/tenants', adminController.createTenant);
router.delete('/tenants/:id', adminController.deleteTenant);

router.get('/ledger', platformLedgerController.getPlatformLedger);
router.post('/ledger', platformLedgerController.addLedgerEntry);
router.get('/ledger/summary', platformLedgerController.getLedgerSummary);

router.get('/analytics', adminController.getPlatformAnalytics);
router.get('/billing', adminController.getBillingData);

export default router;
