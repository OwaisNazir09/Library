import express from 'express';
import { 
  createTenant, 
  getAllTenants, 
  getTenant,
  joinLibrary,
  getMyLibraries
} from './tenant.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAllTenants)
  .post(createTenant);

router.route('/:id')
  .get(getTenant);

// Library membership
router.post('/join', protect, joinLibrary);
router.get('/my', protect, getMyLibraries);

export default router;
