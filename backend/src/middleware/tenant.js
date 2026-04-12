import mongoose from 'mongoose';
import Tenant from '../modules/tenant/tenant.model.js';
import logger from '../utils/logger.js';

export const tenantHandler = async (req, res, next) => {
  req.db = mongoose.connection;

  if (req.method === 'OPTIONS' || req.path.startsWith('/admin') || req.path.startsWith('/auth/login')) {
    return next();
  }

  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
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
