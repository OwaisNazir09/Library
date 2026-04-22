import PlatformLedger from './platformLedger.model.js';

// Auto-generate invoice numbers
const generateInvoiceNumber = async () => {
  const count = await PlatformLedger.countDocuments();
  return `WELIB-INV-${String(count + 1).padStart(6, '0')}`;
};

// Record a platform ledger entry (double-entry bookkeeping)
export const recordPlatformTransaction = async ({
  amount,
  description,
  referenceType = 'manual',
  referenceId = null,
  tenantId = null,
  tenantName = null,
  paymentMethod = 'manual',
  notes = null,
  debitCategory,
  creditCategory,
  createdBy = 'system'
}) => {
  const invoiceNumber = await generateInvoiceNumber();

  // Debit entry
  await PlatformLedger.create({
    type: 'debit',
    category: debitCategory,
    amount,
    description,
    referenceType,
    referenceId,
    tenantId,
    tenantName,
    invoiceNumber,
    paymentMethod,
    notes,
    createdBy
  });

  // Credit entry
  await PlatformLedger.create({
    type: 'credit',
    category: creditCategory,
    amount,
    description,
    referenceType,
    referenceId,
    tenantId,
    tenantName,
    invoiceNumber,
    paymentMethod,
    notes,
    createdBy
  });

  return invoiceNumber;
};

// GET /admin/ledger
export const getPlatformLedger = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, type, tenantId, startDate, endDate } = req.query;
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (tenantId) query.tenantId = tenantId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [entries, total] = await Promise.all([
      PlatformLedger.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('tenantId', 'name subdomain'),
      PlatformLedger.countDocuments(query)
    ]);

    // Aggregate totals
    const totals = await PlatformLedger.aggregate([
      { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' } } }
    ]);

    const summary = {
      totalIncome: 0, totalExpenses: 0,
      subscriptionRevenue: 0, setupFees: 0,
      serverCosts: 0, smsCosts: 0, emailCosts: 0,
      pendingReceivables: 0, refundsPending: 0,
      bankBalance: 0
    };

    totals.forEach(({ _id, total }) => {
      if (_id.type === 'credit') {
        if (_id.category === 'subscription_revenue') summary.subscriptionRevenue += total;
        if (_id.category === 'setup_fee') summary.setupFees += total;
        if (['subscription_revenue', 'setup_fee', 'addon_revenue', 'upgrade_revenue'].includes(_id.category)) {
          summary.totalIncome += total;
        }
        if (_id.category === 'bank_balance') summary.bankBalance += total;
        if (_id.category === 'pending_receivable') summary.pendingReceivables += total;
        if (_id.category === 'refund_pending') summary.refundsPending += total;
      }
      if (_id.type === 'debit') {
        if (_id.category === 'server_cost') summary.serverCosts += total;
        if (_id.category === 'sms_cost') summary.smsCosts += total;
        if (_id.category === 'email_cost') summary.emailCosts += total;
        if (['server_cost', 'sms_cost', 'email_cost', 'staff_cost', 'manual_expense'].includes(_id.category)) {
          summary.totalExpenses += total;
        }
      }
    });

    summary.netProfit = summary.totalIncome - summary.totalExpenses;

    res.status(200).json({
      status: 'success',
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      summary,
      data: entries
    });
  } catch (err) {
    next(err);
  }
};

// POST /admin/ledger (manual entry)
export const addLedgerEntry = async (req, res, next) => {
  try {
    const { type, category, amount, description, tenantId, tenantName, paymentMethod, notes, debitCategory, creditCategory } = req.body;

    if (debitCategory && creditCategory) {
      // Double-entry
      const invNo = await recordPlatformTransaction({
        amount, description, tenantId, tenantName, paymentMethod, notes,
        debitCategory, creditCategory, createdBy: req.user?.email || 'admin'
      });
      return res.status(201).json({ status: 'success', invoiceNumber: invNo, message: 'Double-entry recorded' });
    }

    // Single entry
    const invoiceNumber = await generateInvoiceNumber();
    const entry = await PlatformLedger.create({
      type, category, amount, description, tenantId, tenantName,
      paymentMethod, notes, invoiceNumber, createdBy: req.user?.email || 'admin',
      referenceType: 'manual'
    });

    res.status(201).json({ status: 'success', data: entry });
  } catch (err) {
    next(err);
  }
};

export const getLedgerSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyIncome, monthlyExpenses, lifetimeIncome, lifetimeExpenses, recentEntries] = await Promise.all([
      PlatformLedger.aggregate([
        { $match: { type: 'credit', date: { $gte: monthStart }, category: { $in: ['subscription_revenue', 'setup_fee', 'addon_revenue', 'upgrade_revenue'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      PlatformLedger.aggregate([
        { $match: { type: 'debit', date: { $gte: monthStart }, category: { $in: ['server_cost', 'sms_cost', 'email_cost', 'staff_cost', 'manual_expense'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      PlatformLedger.aggregate([
        { $match: { type: 'credit', category: { $in: ['subscription_revenue', 'setup_fee', 'addon_revenue', 'upgrade_revenue'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      PlatformLedger.aggregate([
        { $match: { type: 'debit', category: { $in: ['server_cost', 'sms_cost', 'email_cost', 'staff_cost', 'manual_expense'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      PlatformLedger.find({ type: 'credit' }).sort({ createdAt: -1 }).limit(10).populate('tenantId', 'name')
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        monthly: {
          income: monthlyIncome[0]?.total || 0,
          expenses: monthlyExpenses[0]?.total || 0,
          profit: (monthlyIncome[0]?.total || 0) - (monthlyExpenses[0]?.total || 0)
        },
        lifetime: {
          income: lifetimeIncome[0]?.total || 0,
          expenses: lifetimeExpenses[0]?.total || 0,
          profit: (lifetimeIncome[0]?.total || 0) - (lifetimeExpenses[0]?.total || 0)
        },
        recentEntries
      }
    });
  } catch (err) {
    next(err);
  }
};
