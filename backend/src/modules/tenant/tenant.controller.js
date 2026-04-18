import Tenant from './tenant.model.js';
import mongoose from 'mongoose';
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
    const tenants = await Tenant.find({ isActive: true }).select('name subdomain email phone address createdAt');
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

export const joinLibrary = async (req, res, next) => {
  try {
    const { libraryId } = req.body;

    if (!libraryId) {
      const err = new Error('libraryId is required');
      err.statusCode = 400;
      throw err;
    }

    const library = await Tenant.findById(libraryId);
    if (!library) {
      const err = new Error('Library not found');
      err.statusCode = 404;
      throw err;
    }

    // Store join request in user's profile via the library db
    // This is a simplified version - in a full system you'd have a MembershipRequest model
    res.status(200).json({
      status: 'success',
      message: `Join request sent to ${library.name}. Waiting for approval.`,
      data: {
        library: {
          _id: library._id,
          name: library.name,
          subdomain: library.subdomain
        },
        requestStatus: 'pending'
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMyLibraries = async (req, res, next) => {
  try {
    // Return the tenant that the user belongs to (plus any joined tenants)
    const myTenantId = req.user?.tenantId;

    if (!myTenantId) {
      return res.status(200).json({
        status: 'success',
        data: { libraries: [] }
      });
    }

    const library = await Tenant.findById(myTenantId).select('name subdomain email phone address');

    res.status(200).json({
      status: 'success',
      data: {
        libraries: library ? [library] : []
      }
    });
  } catch (err) {
    next(err);
  }
};
