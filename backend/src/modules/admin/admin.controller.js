import mongoose from 'mongoose';
import { addDays } from 'date-fns';
import Tenant from '../tenant/tenant.model.js';
import Query from '../query/query.model.js';
import { getModels } from '../../utils/helpers.js';

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
    const { name, subdomain, email, password, plan, trialDays = 14 } = req.body;

    const trialEnd = addDays(new Date(), parseInt(trialDays));
    const expiryDate = trialEnd; // Default expiry to trial end

    // 1. Create the tenant entry
    const newTenant = await Tenant.create({
      name,
      subdomain,
      email,
      plan: plan || 'trial',
      status: 'trial',
      trialStart: new Date(),
      trialEnd,
      expiryDate,
      ownerName: req.body.ownerName || name
    });

    const { User } = getModels(req.db);
    await User.create({
      fullName: req.body.ownerName || `${name} Admin`,
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
