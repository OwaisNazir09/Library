import Tenant from '../tenant/tenant.model.js';
import { getModels } from '../../utils/helpers.js';
import mongoose from 'mongoose';

export const getAdminStats = async (req, res, next) => {
  try {
    const totalTenants = await Tenant.countDocuments();

    const { User } = getModels(mongoose.connection);
    const totalAdmins = await User.countDocuments({ role: 'super_admin' });

    res.status(200).json({
      status: 'success',
      data: {
        totalTenants,
        totalAdmins,
        totalSystemUsers: 1204, // Mocked for now, would aggregate in production
        totalBooks: 45000,      // Mocked
        revenue: '$12,450'      // Mocked
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
      data: tenants
    });
  } catch (err) {
    next(err);
  }
};

export const createTenant = async (req, res, next) => {
  try {
    const { name, subdomain, email, password } = req.body;
    
    // 1. Create the tenant entry
    const newTenant = await Tenant.create({ name, subdomain, email });
    
    // 2. Create the initial Librarian for this tenant
    const { User } = getModels(req.db);
    await User.create({
      fullName: `${name} Admin`,
      email,
      password,
      role: 'librarian',
      tenantId: newTenant._id
    });

    res.status(201).json({
      status: 'success',
      data: newTenant
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTenant = async (req, res, next) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      await Tenant.findByIdAndDelete(req.params.id);
    } else {
      await Tenant.findOneAndDelete({ subdomain: req.params.id.toLowerCase() });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  }
 catch (err) {
    next(err);
  }
};
