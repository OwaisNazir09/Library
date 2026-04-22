import Tenant from '../modules/tenant/tenant.model.js';

export const checkSubscription = async (req, res, next) => {
  try {
    // Skip check for admin routes or public routes if necessary
    // But usually this applies to tenant-specific actions

    if (!req.tenantId) {
      return next();
    }

    const tenant = await Tenant.findById(req.tenantId);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Check if subscription has expired
    const today = new Date();
    if (tenant.status === 'expired' || (tenant.expiryDate && new Date(tenant.expiryDate) < today)) {

      // If it's expired but status is still 'active', update it
      if (tenant.status !== 'expired') {
        tenant.status = 'expired';
        await tenant.save();
      }

      // Allow access to billing page only (if we have one)
      // For now, we block everything that isn't a GET request to basic info, or specific billing routes
      const allowedPaths = ['/api/billing', '/api/tenant/info', '/api/tenants/current'];
      const isAllowedPath = allowedPaths.some(path => req.originalUrl.startsWith(path));

      if (!isAllowedPath) {
        return res.status(403).json({
          status: 'fail',
          message: 'Subscription Expired. Please contact administrator to renew your plan.',
          code: 'SUBSCRIPTION_EXPIRED'
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const restrictToFeature = (featureName) => {
  return (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
      return next();
    }

    if (!req.tenant) {
      return next();
    }

    if (!req.tenant.features || !req.tenant.features[featureName]) {
      return res.status(403).json({
        status: 'fail',
        message: `The '${featureName}' module is not included in your current subscription plan. Please upgrade to gain access.`,
        code: 'FEATURE_GATED'
      });
    }

    next();
  };
};
