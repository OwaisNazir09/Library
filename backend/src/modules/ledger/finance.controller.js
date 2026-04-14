import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const recalcBalance = (account) => {
  account.currentBalance =
    account.openingBalance +
    account.totalCharged +
    account.debitNoteTotal -
    account.totalPaid -
    account.creditNoteTotal;
  account.status =
    account.currentBalance <= 0 ? 'clear' :
    account.currentBalance > 0 ? 'due' : 'clear';
};

const genReceiptNumber = async (Receipt, tenantId) => {
  const year = new Date().getFullYear();
  const count = await Receipt.countDocuments({ tenantId });
  return `RCP-${year}-${String(count + 1).padStart(5, '0')}`;
};

const genAccountNumber = async (StudentAccount, tenantId) => {
  const count = await StudentAccount.countDocuments({ tenantId });
  return `ACC-${String(count + 1).padStart(5, '0')}`;
};

// ── Finance Dashboard Stats ──────────────────────────────────────────────────
export const getFinanceStats = async (req, res, next) => {
  try {
    const { Transaction, StudentAccount } = getModels(req.db);
    const filter = { tenantId: req.tenantId };

    // Income & Expense aggregation
    const [incomeStat] = await Transaction.aggregate([
      { $match: { ...filter, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const [expenseStat] = await Transaction.aggregate([
      { $match: { ...filter, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const [fineStat] = await Transaction.aggregate([
      { $match: { ...filter, type: 'fine' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Today's collection
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [todayStat] = await Transaction.aggregate([
      { $match: { ...filter, type: 'income', date: { $gte: startOfToday, $lte: endOfToday } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Pending fees
    const [pendingStat] = await StudentAccount.aggregate([
      { $match: { ...filter, currentBalance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$currentBalance' } } }
    ]);

    const overdueCount = await StudentAccount.countDocuments({ ...filter, status: 'overdue' });
    const dueCount = await StudentAccount.countDocuments({ ...filter, status: 'due' });

    const totalIncome = (incomeStat?.total || 0) + (fineStat?.total || 0);
    const totalExpenses = expenseStat?.total || 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        pendingFees: pendingStat?.total || 0,
        todayCollection: todayStat?.total || 0,
        overdueCount,
        dueCount,
        fineCollected: fineStat?.total || 0
      }
    });
  } catch (err) { next(err); }
};

// ── Student Accounts ─────────────────────────────────────────────────────────
export const getStudentAccounts = async (req, res, next) => {
  try {
    const { StudentAccount } = getModels(req.db);
    const filter = { tenantId: req.tenantId };

    const features = new ApiFeatures(
      StudentAccount.find(filter).populate('studentId', 'fullName email phone idNumber profilePicture'),
      req.query
    ).filter().search(['accountNumber']).sort().paginate();

    const accounts = await features.query;
    const total = await StudentAccount.countDocuments(filter);

    res.status(200).json({ status: 'success', results: accounts.length, total, data: accounts });
  } catch (err) { next(err); }
};

export const getStudentAccount = async (req, res, next) => {
  try {
    const { StudentAccount, Transaction } = getModels(req.db);
    const filter = { tenantId: req.tenantId, studentId: req.params.studentId };

    let account = await StudentAccount.findOne(filter)
      .populate('studentId', 'fullName email phone idNumber profilePicture');

    if (!account) {
      const error = new Error('No account found for this student');
      error.statusCode = 404;
      throw error;
    }

    const txFilter = { tenantId: req.tenantId, studentId: req.params.studentId };
    if (req.query.startDate && req.query.endDate) {
      txFilter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    }

    const features = new ApiFeatures(
      Transaction.find(txFilter).sort({ date: -1 }),
      req.query
    ).paginate();

    const transactions = await features.query;
    const totalTransactions = await Transaction.countDocuments(txFilter);

    res.status(200).json({
      status: 'success',
      data: { account, transactions, totalTransactions }
    });
  } catch (err) { next(err); }
};

// ── Add Payment (Income from Student) ────────────────────────────────────────
export const addPayment = async (req, res, next) => {
  try {
    const { StudentAccount, Transaction, Receipt } = getModels(req.db);
    const { amount, paymentMethod, description, notes, date, category } = req.body;

    if (!amount || amount <= 0) {
      const error = new Error('Invalid payment amount');
      error.statusCode = 400;
      throw error;
    }

    const account = await StudentAccount.findOne({ tenantId: req.tenantId, studentId: req.params.studentId });
    if (!account) {
      const error = new Error('Student account not found');
      error.statusCode = 404;
      throw error;
    }

    account.totalPaid += Number(amount);
    account.lastPaymentDate = date ? new Date(date) : new Date();
    account.lastPaymentAmount = Number(amount);
    recalcBalance(account);
    await account.save();

    const receiptNumber = await genReceiptNumber(Receipt, req.tenantId);

    const transaction = await Transaction.create({
      tenantId: req.tenantId,
      type: 'income',
      category: category || 'other_income',
      amount: Number(amount),
      paymentMethod: paymentMethod || 'cash',
      studentId: req.params.studentId,
      studentAccountId: account._id,
      description: description || 'Payment Received',
      notes,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user?._id,
      runningBalance: account.currentBalance
    });

    const receipt = await Receipt.create({
      tenantId: req.tenantId,
      receiptNumber,
      type: 'payment',
      studentId: req.params.studentId,
      transactionId: transaction._id,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'cash',
      description: description || 'Payment Received',
      notes,
      date: date ? new Date(date) : new Date()
    });

    transaction.receiptId = receipt._id;
    await transaction.save();

    const populatedReceipt = await Receipt.findById(receipt._id)
      .populate('studentId', 'fullName email phone idNumber');

    res.status(201).json({ status: 'success', data: { transaction, receipt: populatedReceipt, account } });
  } catch (err) { next(err); }
};

// ── Add Charge / Fine ─────────────────────────────────────────────────────────
export const addCharge = async (req, res, next) => {
  try {
    const { StudentAccount, Transaction, Receipt } = getModels(req.db);
    const { amount, category, description, notes, date, isFine } = req.body;

    if (!amount || amount <= 0 || !description) {
      const error = new Error('Amount and description are required');
      error.statusCode = 400;
      throw error;
    }

    const account = await StudentAccount.findOne({ tenantId: req.tenantId, studentId: req.params.studentId });
    if (!account) {
      const error = new Error('Student account not found');
      error.statusCode = 404;
      throw error;
    }

    account.totalCharged += Number(amount);
    if (isFine) account.totalFines += Number(amount);
    recalcBalance(account);
    await account.save();

    const txType = isFine ? 'fine' : 'income';
    const receiptType = isFine ? 'fine' : 'fee';

    const receiptNumber = await genReceiptNumber(Receipt, req.tenantId);

    const transaction = await Transaction.create({
      tenantId: req.tenantId,
      type: txType,
      category: category || (isFine ? 'late_fine' : 'other_income'),
      amount: Number(amount),
      paymentMethod: 'other',
      studentId: req.params.studentId,
      studentAccountId: account._id,
      description,
      notes,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user?._id,
      runningBalance: account.currentBalance
    });

    const receipt = await Receipt.create({
      tenantId: req.tenantId,
      receiptNumber,
      type: receiptType,
      studentId: req.params.studentId,
      transactionId: transaction._id,
      amount: Number(amount),
      paymentMethod: 'other',
      description,
      notes,
      date: date ? new Date(date) : new Date()
    });

    transaction.receiptId = receipt._id;
    await transaction.save();

    res.status(201).json({ status: 'success', data: { transaction, receipt, account } });
  } catch (err) { next(err); }
};

// ── Credit Note (reduces student balance) ─────────────────────────────────────
export const addCreditNote = async (req, res, next) => {
  try {
    const { StudentAccount, Transaction, Receipt } = getModels(req.db);
    const { amount, description, notes, date } = req.body;

    if (!amount || amount <= 0) {
      const error = new Error('Invalid credit note amount');
      error.statusCode = 400;
      throw error;
    }

    const account = await StudentAccount.findOne({ tenantId: req.tenantId, studentId: req.params.studentId });
    if (!account) {
      const error = new Error('Student account not found');
      error.statusCode = 404;
      throw error;
    }

    account.creditNoteTotal += Number(amount);
    recalcBalance(account);
    await account.save();

    const receiptNumber = await genReceiptNumber(Receipt, req.tenantId);
    const transaction = await Transaction.create({
      tenantId: req.tenantId,
      type: 'credit_note',
      category: 'credit_balance',
      amount: Number(amount),
      paymentMethod: 'other',
      studentId: req.params.studentId,
      studentAccountId: account._id,
      description: description || 'Credit Note',
      notes,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user?._id,
      runningBalance: account.currentBalance
    });

    const receipt = await Receipt.create({
      tenantId: req.tenantId,
      receiptNumber,
      type: 'credit_note',
      studentId: req.params.studentId,
      transactionId: transaction._id,
      amount: Number(amount),
      paymentMethod: 'other',
      description: description || 'Credit Note',
      notes,
      date: date ? new Date(date) : new Date()
    });

    transaction.receiptId = receipt._id;
    await transaction.save();

    res.status(201).json({ status: 'success', data: { transaction, receipt, account } });
  } catch (err) { next(err); }
};

// ── Debit Note (increases student balance) ────────────────────────────────────
export const addDebitNote = async (req, res, next) => {
  try {
    const { StudentAccount, Transaction, Receipt } = getModels(req.db);
    const { amount, description, notes, date } = req.body;

    if (!amount || amount <= 0) {
      const error = new Error('Invalid debit note amount');
      error.statusCode = 400;
      throw error;
    }

    const account = await StudentAccount.findOne({ tenantId: req.tenantId, studentId: req.params.studentId });
    if (!account) {
      const error = new Error('Student account not found');
      error.statusCode = 404;
      throw error;
    }

    account.debitNoteTotal += Number(amount);
    recalcBalance(account);
    await account.save();

    const receiptNumber = await genReceiptNumber(Receipt, req.tenantId);
    const transaction = await Transaction.create({
      tenantId: req.tenantId,
      type: 'debit_note',
      category: 'advance_payment',
      amount: Number(amount),
      paymentMethod: 'other',
      studentId: req.params.studentId,
      studentAccountId: account._id,
      description: description || 'Debit Note',
      notes,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user?._id,
      runningBalance: account.currentBalance
    });

    const receipt = await Receipt.create({
      tenantId: req.tenantId,
      receiptNumber,
      type: 'debit_note',
      studentId: req.params.studentId,
      transactionId: transaction._id,
      amount: Number(amount),
      paymentMethod: 'other',
      description: description || 'Debit Note',
      notes,
      date: date ? new Date(date) : new Date()
    });

    transaction.receiptId = receipt._id;
    await transaction.save();

    res.status(201).json({ status: 'success', data: { transaction, receipt, account } });
  } catch (err) { next(err); }
};

// ── Add Expense (library operational expense) ─────────────────────────────────
export const addExpense = async (req, res, next) => {
  try {
    const { Transaction } = getModels(req.db);
    const { amount, category, description, notes, date, paymentMethod } = req.body;

    if (!amount || amount <= 0 || !description) {
      const error = new Error('Amount and description are required');
      error.statusCode = 400;
      throw error;
    }

    const transaction = await Transaction.create({
      tenantId: req.tenantId,
      type: 'expense',
      category: category || 'other_expense',
      amount: Number(amount),
      paymentMethod: paymentMethod || 'cash',
      description,
      notes,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user?._id
    });

    res.status(201).json({ status: 'success', data: transaction });
  } catch (err) { next(err); }
};

// ── Get All Transactions ──────────────────────────────────────────────────────
export const getTransactions = async (req, res, next) => {
  try {
    const { Transaction } = getModels(req.db);
    const filter = { tenantId: req.tenantId };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.startDate && req.query.endDate) {
      filter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    }

    const features = new ApiFeatures(
      Transaction.find(filter)
        .populate('studentId', 'fullName email idNumber')
        .sort({ date: -1 }),
      req.query
    ).paginate();

    const transactions = await features.query;
    const total = await Transaction.countDocuments(filter);

    res.status(200).json({ status: 'success', results: transactions.length, total, data: transactions });
  } catch (err) { next(err); }
};

// ── Receipts ──────────────────────────────────────────────────────────────────
export const getReceipts = async (req, res, next) => {
  try {
    const { Receipt } = getModels(req.db);
    const filter = { tenantId: req.tenantId };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.startDate && req.query.endDate) {
      filter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    }

    const features = new ApiFeatures(
      Receipt.find(filter)
        .populate('studentId', 'fullName email phone idNumber')
        .sort({ date: -1 }),
      req.query
    ).paginate();

    const receipts = await features.query;
    const total = await Receipt.countDocuments(filter);

    res.status(200).json({ status: 'success', results: receipts.length, total, data: receipts });
  } catch (err) { next(err); }
};

export const getReceipt = async (req, res, next) => {
  try {
    const { Receipt } = getModels(req.db);
    const receipt = await Receipt.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('studentId', 'fullName email phone idNumber');
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: 'success', data: receipt });
  } catch (err) { next(err); }
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const getDailyReport = async (req, res, next) => {
  try {
    const { Transaction } = getModels(req.db);
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const transactions = await Transaction.find({
      tenantId: req.tenantId,
      date: { $gte: start, $lte: end }
    }).populate('studentId', 'fullName idNumber').sort({ date: -1 });

    const summary = transactions.reduce((acc, t) => {
      if (t.type === 'income' || t.type === 'fine') acc.income += t.amount;
      if (t.type === 'expense') acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });

    summary.net = summary.income - summary.expense;

    res.status(200).json({ status: 'success', data: { summary, transactions } });
  } catch (err) { next(err); }
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    const { Transaction } = getModels(req.db);
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const byCategory = await Transaction.aggregate([
      { $match: { tenantId: req.tenantId, date: { $gte: start, $lte: end } } },
      { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.type': 1, total: -1 } }
    ]);

    const [totals] = await Transaction.aggregate([
      { $match: { tenantId: req.tenantId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $in: ['$type', ['income', 'fine']] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        year, month,
        totalIncome: totals?.income || 0,
        totalExpenses: totals?.expense || 0,
        netProfit: (totals?.income || 0) - (totals?.expense || 0),
        byCategory
      }
    });
  } catch (err) { next(err); }
};

export const getPendingReport = async (req, res, next) => {
  try {
    const { StudentAccount } = getModels(req.db);
    const accounts = await StudentAccount.find({
      tenantId: req.tenantId,
      currentBalance: { $gt: 0 }
    }).populate('studentId', 'fullName email phone idNumber').sort({ currentBalance: -1 });

    const totalPending = accounts.reduce((s, a) => s + a.currentBalance, 0);

    res.status(200).json({ status: 'success', data: { totalPending, accounts } });
  } catch (err) { next(err); }
};

export const getPLReport = async (req, res, next) => {
  try {
    const { Transaction } = getModels(req.db);
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthly = await Transaction.aggregate([
      {
        $match: {
          tenantId: req.tenantId,
          date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    // Pivot into array of 12 months
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      net: 0
    }));

    monthly.forEach(({ _id: { month, type }, total }) => {
      const m = months[month - 1];
      if (type === 'income' || type === 'fine') m.income += total;
      if (type === 'expense') m.expense += total;
    });

    months.forEach(m => { m.net = m.income - m.expense; });

    const yearTotal = months.reduce(
      (acc, m) => ({ income: acc.income + m.income, expense: acc.expense + m.expense, net: acc.net + m.net }),
      { income: 0, expense: 0, net: 0 }
    );

    res.status(200).json({ status: 'success', data: { year, months, yearTotal } });
  } catch (err) { next(err); }
};

// ── Ensure Student Account exists (called internally or via API) ───────────────
export const ensureStudentAccount = async (db, tenantId, studentId) => {
  const { StudentAccount } = getModels(db);
  const existing = await StudentAccount.findOne({ tenantId, studentId });
  if (existing) return existing;
  const { genAccountNumber: _ } = {}; // just use the helper inline
  const count = await StudentAccount.countDocuments({ tenantId });
  const accountNumber = `ACC-${String(count + 1).padStart(5, '0')}`;
  return StudentAccount.create({ tenantId, studentId, accountNumber });
};
