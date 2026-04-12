import express from 'express';
import { createTenant, getAllTenants, getTenant } from './tenant.controller.js';

const router = express.Router();

router.route('/')
  .get(getAllTenants)
  .post(createTenant);

router.route('/:id')
  .get(getTenant);

export default router;
