import mongoose from 'mongoose';
import { addDays } from 'date-fns';
import Tenant from '../tenant/tenant.model.js';
import Query from '../query/query.model.js';
import { getModels } from '../../utils/helpers.js';
import sendEmail from '../../utils/emailService.js';
import { welcomeEmailTemplate } from '../../templates/emails/welcomeEmail.js';
import { libraryInvitationTemplate } from '../../templates/emails/libraryInvitation.js';
import { seedChartOfAccounts, recordTransaction, getSystemAccount } from '../ledger/finance.controller.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = addDays(now, -30);
    const sevenDaysAhead = addDays(now, 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLibraries,
      activeLibraries,
      trialLibraries,
      suspendedLibraries,
      expiredLibraries,
      expiringSoonCount,
      recentLibraries
    ] = await Promise.all([
      Tenant.countDocuments(),
      Tenant.countDocuments({ status: 'active' }),
      Tenant.countDocuments({ status: 'trial' }),
      Tenant.countDocuments({ status: 'suspended' }),
      Tenant.countDocuments({ status: 'expired' }),
      Tenant.countDocuments({
        expiryDate: { $lte: sevenDaysAhead, $gte: now },
        status: { $ne: 'expired' }
      }),
      Tenant.find().sort({ createdAt: -1 }).limit(5).select('name status plan createdAt email').populate('subscriptionPlanId', 'name')
    ]);

    // Growth data — last 6 months
    const growthData = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await Tenant.countDocuments({ createdAt: { $gte: start, $lte: end } });
      growthData.push({
        name: start.toLocaleString('default', { month: 'short' }),
        libraries: count
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        totalLibraries,
        activeLibraries,
        trialLibraries,
        suspendedLibraries,
        expiredLibraries,
        monthlyRevenue: 0,
        totalRevenue: 0,
        newSignups: await Tenant.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        expiringSoon: expiringSoonCount,
        recentLibraries,
        growthData
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find().populate('subscriptionPlanId').sort({ createdAt: -1 });


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
    const {
      name,
      subdomain,
      email,
      password,
      plan,
      subscriptionPlanId,
      trialDays = 14,
      ownerName,
      phone,
      whatsapp,
      libraryType,
      libraryCode,
      description,
      openingTime,
      closingTime,
      address,
      city,
      state,
      pincode,
      country,
      limits,
      features
    } = req.body;

    const trialEnd = addDays(new Date(), parseInt(trialDays));
    const expiryDate = trialEnd;

    const newTenant = await Tenant.create({
      name,
      subdomain,
      email,
      databaseName: `lib_${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      plan: plan || 'trial',
      subscriptionPlanId: subscriptionPlanId || null,
      status: 'active',
      trialStart: new Date(),
      trialEnd,
      expiryDate,
      ownerName: ownerName || name,
      phone,
      whatsapp,
      libraryType,
      libraryCode: libraryCode || `LIB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      description,
      openingTime,
      closingTime,
      address,
      city,
      state,
      pincode,
      country,
      limits: limits || {
        maxBooks: 500,
        maxStudents: 300,
        maxStaff: 5
      },
      features: features || {
        bookManagement: true,
        students: true,
        circulation: true,
        finance: true,
        reports: true,
        studyDesks: true,
        digitalLibrary: true
      }
    });

    const finalPassword = password || Math.random().toString(36).substring(2, 10);

    const { User } = getModels(req.db);
    const adminUser = await User.create({
      fullName: ownerName || `${name} Admin`,
      email,
      password: finalPassword,
      role: 'librarian',
      tenantId: newTenant._id,
      status: 'approved'
    });

    // 2. Initialize Finance (Seed COA and create Ledger Entry)
    try {
      await seedChartOfAccounts(req.db, newTenant._id);

      const salesAccount = await getSystemAccount(req.db, newTenant._id, 'Service Income', 'Income', 'Service Income');
      const cashAccount = await getSystemAccount(req.db, newTenant._id, 'Cash in Hand', 'Assets', 'Cash');

      await recordTransaction(req.db, newTenant._id, {
        debitAccountId: cashAccount._id,
        creditAccountId: salesAccount._id,
        amount: 0.01,
        type: 'income',
        description: 'System Activation & Infrastructure Provisioning',
        userId: adminUser._id
      });
    } catch (finErr) {
      console.error('Failed to initialize finance for new tenant:', finErr);
    }

    try {
      const loginUrl = `http://${subdomain}.welib.app/login`;

      await sendEmail({
        email: email,
        subject: 'Welcome to Welib — Your Library is Ready',
        html: libraryInvitationTemplate({
          ownerName: ownerName || name,
          libraryName: name,
          email: email,
          password: finalPassword,
          loginUrl,
          plan: plan || 'Trial',
          trialExpiry: trialEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        })
      });
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
    }

    res.status(201).json({
      status: 'success',
      data: newTenant
    });
  } catch (err) {
    next(err);
  }
};

export const updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!tenant) return res.status(404).json({ status: 'fail', message: 'No tenant found' });

    res.status(200).json({
      status: 'success',
      data: tenant
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) return res.status(404).json({ status: 'fail', message: 'No tenant found' });

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
  catch (err) {
    next(err);
  }
};

export const getLibraryAnalytics = async (req, res, next) => {
  try {
    const tenantId = req.params.id;
    const { User, Book, Transaction } = getModels(req.db);

    const [totalStudents, totalBooks, transactions] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      Book.countDocuments(),
      Transaction.countDocuments()
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalStudents,
        totalBooks,
        activeUsers: totalStudents,
        transactions,
        revenue: 0
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllGlobalUsers = async (req, res, next) => {
  try {
    const { User } = getModels(mongoose.connection);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('tenantId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (err) {
    next(err);
  }
};

export const updateGlobalUser = async (req, res, next) => {
  try {
    const { User } = getModels(mongoose.connection);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) return res.status(404).json({ status: 'fail', message: 'No user found' });

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const getAllQueries = async (req, res, next) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: queries.length,
      data: queries
    });
  } catch (err) {
    next(err);
  }
};

export const updateQuery = async (req, res, next) => {
  try {
    const query = await Query.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!query) return res.status(404).json({ status: 'fail', message: 'No query found' });

    res.status(200).json({
      status: 'success',
      data: query
    });
  } catch (err) {
    next(err);
  }
};

export const getBillingData = async (req, res, next) => {
  try {
    const { PlatformLedger } = getModels(req.db);
    // Get all tenants with their subscription info
    const tenants = await Tenant.find()
      .select('name ownerName email status plan trialStart trialEnd expiryDate createdAt')
      .populate('subscriptionPlanId', 'name price billingCycle');

    const billingData = tenants.map(tenant => ({
      libraryId: tenant._id,
      libraryName: tenant.name,
      ownerName: tenant.ownerName,
      plan: tenant.subscriptionPlanId?.name || tenant.plan,
      amount: tenant.subscriptionPlanId?.price || 0,
      billingCycle: tenant.subscriptionPlanId?.billingCycle || 'Monthly',
      startDate: tenant.createdAt,
      nextDue: tenant.expiryDate,
      paymentStatus: tenant.status === 'active' ? 'Paid' : tenant.status === 'trial' ? 'Trial' : 'Overdue',
      libraryStatus: tenant.status,
      trialStatus: tenant.status === 'trial',
      autoRenewal: false // Feature flag placeholder
    }));

    res.status(200).json({
      status: 'success',
      results: billingData.length,
      data: billingData
    });
  } catch (err) {
    next(err);
  }
};

export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const sixMonthsAgo = addDays(now, -180);

    const [
      planUsage,
      growthData,
      expiryForecast
    ] = await Promise.all([
      Tenant.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } }
      ]),
      Tenant.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Tenant.aggregate([
        { $match: { expiryDate: { $gte: now, $lte: addDays(now, 30) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$expiryDate' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Format plan usage
    const planDistribution = planUsage.map(p => ({
      name: p._id || 'free',
      value: p.count
    }));

    // Placeholder for Top Paying Libraries & Revenue by Month
    // This should ideally pull from PlatformLedger, but we keep it simple for now
    const topPayingLibraries = await Tenant.find({ status: 'active' })
      .select('name plan')
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        topPayingLibraries,
        planUsage: planDistribution,
        revenueByMonth: [], // Integrate with ledger later
        newLibrariesGrowth: growthData.map(g => ({ month: g._id, libraries: g.count })),
        expiryForecast: expiryForecast.map(e => ({ date: e._id, expiries: e.count }))
      }
    });
  } catch (err) {
    next(err);
  }
};
