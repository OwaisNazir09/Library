import Tenant from './tenant.model.js';
import logger from '../../utils/logger.js';

export const createTenant = async (req, res, next) => {
  try {
    const newTenant = await Tenant.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tenant: newTenant
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find();
    res.status(200).json({
      status: 'success',
      results: tenants.length,
      data: {
        tenants
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getTenant = async (req, res, next) => {
  try {
    let tenant;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      tenant = await Tenant.findById(req.params.id);
    } else {
      tenant = await Tenant.findOne({ subdomain: req.params.id.toLowerCase() });
    }

    if (!tenant) {
      const error = new Error('No tenant found with that ID or Subdomain');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      status: 'success',
      data: {
        tenant
      }
    });
  } catch (err) {
    next(err);
  }
};
