import express from 'express';
import {
  createTenant,
  getAllTenants,
  getTenant,
  joinLibrary,
  getMyLibraries,
  getCurrentTenant
} from './tenant.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAllTenants)
  .post(createTenant);

router.post('/join', protect, joinLibrary);
router.get('/my', protect, getMyLibraries);
router.get('/current', getCurrentTenant);

router.route('/:id')
  .get(getTenant);

export default router;
