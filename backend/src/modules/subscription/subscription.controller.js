import SubscriptionPlan from './subscription.model.js';
import Tenant from '../tenant/tenant.model.js';

export const getAllPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find();

    res.status(200).json({
      status: 'success',
      results: plans.length,
      data: {
        plans
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const newPlan = await SubscriptionPlan.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        plan: newPlan
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: 'No plan found with that ID' });
    }

    await Tenant.updateMany(
      { subscriptionPlanId: updatedPlan._id },
      {
        $set: {
          features: updatedPlan.features,
          limits: updatedPlan.limits,
          plan: updatedPlan.name
        }
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        plan: updatedPlan
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deletePlan = async (req, res, next) => {
  try {
    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

    if (!deletedPlan) {
      return res.status(404).json({ message: 'No plan found with that ID' });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

export const assignPlanToLibrary = async (req, res, next) => {
  try {
    const { libraryId, planId, startDate, expiryDate, notes } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    const tenant = await Tenant.findById(libraryId);
    if (!tenant) {
      return res.status(404).json({ message: 'Library (Tenant) not found' });
    }

    // Update tenant subscription details
    tenant.subscriptionPlanId = planId;
    tenant.plan = plan.name;
    tenant.expiryDate = new Date(expiryDate);
    tenant.status = 'active';

    // Sync features and limits from plan
    tenant.features = { ...plan.features };
    tenant.limits = { ...plan.limits };

    await tenant.save();

    res.status(200).json({
      status: 'success',
      message: 'Package assigned to library successfully',
      data: {
        tenant
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getSubscriptionAnalytics = async (req, res, next) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeSubscriptions = await Tenant.countDocuments({ status: 'active', paymentStatus: 'paid' });
    const expiredSubscriptions = await Tenant.countDocuments({ status: 'expired' });
    const trialSubscriptions = await Tenant.countDocuments({ status: 'trial' });

    // Calculate Revenue and MRR
    const paidTenants = await Tenant.find({ 
      paymentStatus: 'paid',
      subscriptionPlanId: { $exists: true }
    }).populate('subscriptionPlanId');

    let totalRevenue = 0;
    let mrr = 0;

    paidTenants.forEach(tenant => {
      const plan = tenant.subscriptionPlanId;
      if (plan) {
        totalRevenue += plan.price;
        // Normalize MRR
        if (plan.billingCycle === 'monthly') mrr += plan.price;
        if (plan.billingCycle === 'quarterly') mrr += (plan.price / 3);
        if (plan.billingCycle === 'yearly') mrr += (plan.price / 12);
      }
    });

    // Most used plan
    const planUsage = await Tenant.aggregate([
      { $match: { subscriptionPlanId: { $exists: true } } },
      { $group: { _id: '$subscriptionPlanId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: '_id',
          foreignField: '_id',
          as: 'planDetails'
        }
      },
      { $unwind: '$planDetails' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalTenants,
        activeSubscriptions,
        expiredSubscriptions,
        trialSubscriptions,
        totalRevenue: Math.round(totalRevenue),
        mrr: Math.round(mrr),
        mostUsedPlan: planUsage[0] || null
      }
    });
  } catch (err) {
    next(err);
  }
};
