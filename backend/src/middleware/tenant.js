import mongoose from 'mongoose';
import Tenant from '../modules/tenant/tenant.model.js';
import logger from '../utils/logger.js';

export const tenantHandler = async (req, res, next) => {
  req.db = mongoose.connection;

  // Debug logs
  console.log(`[TenantHandler] Path: ${req.path}, Method: ${req.method}`);
  console.log(`[TenantHandler] Headers:`, JSON.stringify(req.headers, null, 2));

  // Skip tenant check for these routes
  const isGlobalRoute = 
    req.method === 'OPTIONS' || 
    req.path.includes('/admin') || 
    req.path.includes('/auth/login') ||
    req.path.includes('/auth/signup') ||
    req.path.includes('/blogs') ||
    req.path.includes('/resources/public') ||
    (req.method === 'GET' && req.path.startsWith('/resources/')) ||
    req.path.includes('/tenants');

  if (isGlobalRoute) {
    return next();
  }

  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    console.log(`[TenantHandler] Missing x-tenant-id for path: ${req.path}`);
    return res.status(400).json({
      status: 'fail',
      message: 'x-tenant-id header is missing for tenant-specific resources'
    });
  }

  try {
    let tenant;
    if (mongoose.Types.ObjectId.isValid(tenantId)) {
      tenant = await Tenant.findById(tenantId);
    } else {
      tenant = await Tenant.findOne({ subdomain: tenantId.toLowerCase() });
    }

    if (!tenant) {
      return res.status(404).json({
        status: 'fail',
        message: 'Shared node not found'
      });
    }

    req.tenantId = tenant._id;
    next();
  } catch (err) {
    logger.error('Tenant identification error:', err);
    next(err);
  }
};
