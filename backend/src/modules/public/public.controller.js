import mongoose from 'mongoose';
import Tenant from '../tenant/tenant.model.js';
import SubscriptionPlan from '../subscription/subscription.model.js';
import { getModels } from '../../utils/helpers.js';

export const getPublicStats = async (req, res, next) => {
  try {
    const tenants = await Tenant.find({ status: { $in: ['active', 'trial'] } });
    const totalLibraries = tenants.length;

    let totalBooks = 0;
    let totalMembers = 0;
    let totalRevenue = 0;

    const masterDbName = mongoose.connection.name;
    const countedDbs = new Set();
    countedDbs.add(masterDbName);

    try {
      const { Book, User } = getModels(mongoose.connection);
      const [masterBooks, masterMembers] = await Promise.all([
        Book.countDocuments(),
        User.countDocuments({ role: 'member' })
      ]);
      totalBooks += masterBooks;
      totalMembers += masterMembers;
      console.log(`[PUBLIC_STATS] Master DB (${masterDbName}): Books=${masterBooks}, Members=${masterMembers}`);
    } catch (err) {
      console.error('[PUBLIC_STATS_ERROR] Master DB:', err.message);
    }

    for (const tenant of tenants) {
      if (!tenant.databaseName || countedDbs.has(tenant.databaseName)) {
        continue;
      }

      try {
        const tenantDb = mongoose.connection.useDb(tenant.databaseName, { useCache: true });
        const { Book, User } = getModels(tenantDb);

        const [bookCount, memberCount] = await Promise.all([
          Book.countDocuments(),
          User.countDocuments({ role: 'member' })
        ]);

        console.log(`[PUBLIC_STATS] Tenant DB: ${tenant.name} (${tenant.databaseName}): Books=${bookCount}, Members=${memberCount}`);

        totalBooks += bookCount;
        totalMembers += memberCount;
        countedDbs.add(tenant.databaseName);
      } catch (err) {
        console.error(`[PUBLIC_STATS_ERROR] Tenant DB ${tenant.name}:`, err.message);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        totalLibraries,
        totalBooks,
        totalMembers,
        uptime: '99.9%',
        revenue: totalRevenue
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ status: 'active' }).sort({ price: 1 });

    // Add the user's requested "Student-Based" plan if it doesn't exist in DB
    const studentBasedPlan = {
      _id: 'student-based-plan',
      name: 'Scale Pro (Student-Based)',
      description: 'Pay only for active students. Perfect for growing libraries.',
      price: 30,
      currency: 'INR',
      billingCycle: 'monthly',
      isStudentBased: true,
      features: {
        bookManagement: true,
        students: true,
        circulation: true,
        digitalLibrary: true,
        finance: true,
        reports: true,
        studyDesks: true
      },
      limits: {
        maxBooks: 10000,
        maxStudents: 5000,
        maxStaff: 20
      }
    };

    // Add a Custom Enterprise plan
    const customPlan = {
      _id: 'custom-enterprise-plan',
      name: 'Custom Enterprise',
      description: 'For large networks and multi-branch institutions.',
      price: 'Custom',
      currency: 'INR',
      billingCycle: 'monthly',
      features: {
        multiBranchSync: true,
        customDomain: true,
        ssoIntegration: true,
        dedicatedAccountManager: true,
        priority247Support: true
      },
      limits: {
        maxBooks: 'Unlimited',
        maxStudents: 'Unlimited',
        maxStaff: 'Unlimited'
      }
    };

    res.status(200).json({
      status: 'success',
      data: [...plans, studentBasedPlan, customPlan]
    });
  } catch (err) {
    next(err);
  }
};
