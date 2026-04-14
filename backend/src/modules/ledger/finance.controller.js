import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

// ── Accounting Helpers ───────────────────────────────────────────────────────

export const recordTransaction = async (db, tenantId, details) => {
  const { Account, Transaction } = getModels(db);
  const {
    debitAccountId,
    creditAccountId,
    amount,
    type,
    description,
    reference,
    date,
    userId
  } = details;

  const debitAccount = await Account.findOne({ _id: debitAccountId, tenantId });
  const creditAccount = await Account.findOne({ _id: creditAccountId, tenantId });

  if (!debitAccount || !creditAccount) {
    throw new Error('Debit or Credit account not found');
  }


  const updateBalance = (account, amt, isDebit) => {
    const isAssetOrExpense = ['Assets', 'Expenses'].includes(account.type);

    if (isAssetOrExpense) {
      if (isDebit) account.currentBalance += amt;
      else account.currentBalance -= amt;
    } else {
      // Liabilities, Income, Equity
      if (isDebit) account.currentBalance -= amt;
      else account.currentBalance += amt;
    }
  };

  updateBalance(debitAccount, amount, true);
  updateBalance(creditAccount, amount, false);

  await debitAccount.save();
  await creditAccount.save();

  return await Transaction.create({
    tenantId,
    debitAccountId,
    creditAccountId,
    amount,
    type,
    description,
    reference,
    date: date || new Date(),
    createdBy: userId,
    debitAccountBalance: debitAccount.currentBalance,
    creditAccountBalance: creditAccount.currentBalance
  });
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
    const { Account } = getModels(req.db);
    const filter = { tenantId: req.tenantId };

    const accounts = await Account.find(filter);

    const stats = accounts.reduce((acc, accnt) => {
      if (accnt.type === 'Assets') acc.totalAssets += accnt.currentBalance;
      if (accnt.type === 'Liabilities') acc.totalLiabilities += accnt.currentBalance;
      if (accnt.type === 'Income') acc.totalIncome += accnt.currentBalance;
      if (accnt.type === 'Expenses') acc.totalExpenses += accnt.currentBalance;
      if (accnt.type === 'Equity') acc.totalEquity += accnt.currentBalance;

      if (accnt.subType === 'Student Receivable') acc.pendingFees += accnt.currentBalance;
      if (['Cash', 'Bank', 'UPI', 'Wallet'].includes(accnt.subType)) acc.liquidAssets += accnt.currentBalance;

      return acc;
    }, {
      totalAssets: 0, totalLiabilities: 0, totalIncome: 0,
      totalExpenses: 0, totalEquity: 0, pendingFees: 0, liquidAssets: 0
    });

    res.status(200).json({
      status: 'success',
      data: {
        ...stats,
        netProfit: stats.totalIncome - stats.totalExpenses
      }
    });
  } catch (err) { next(err); }
};

// ── Account Management ───────────────────────────────────────────────────────
export const getAccounts = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const filter = { tenantId: req.tenantId };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.subType) filter.subType = req.query.subType;

    const accounts = await Account.find(filter)
      .populate('parentAccount', 'name')
      .populate('studentId', 'fullName idNumber profilePicture')
      .sort({ type: 1, name: 1 });

    res.status(200).json({ status: 'success', data: accounts });
  } catch (err) { next(err); }
};

export const addAccount = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const account = await Account.create({
      ...req.body,
      tenantId: req.tenantId,
      currentBalance: req.body.openingBalance || 0
    });
    res.status(201).json({ status: 'success', data: account });
  } catch (err) { next(err); }
};

export const getAccountLedger = async (req, res, next) => {
  try {
    const { Account, Transaction } = getModels(req.db);
    const id = req.params.id;

    let account = await Account.findOne({ _id: id, tenantId: req.tenantId })
      .populate('studentId', 'fullName email phone profilePicture');

    if (!account) {
      account = await Account.findOne({ studentId: id, tenantId: req.tenantId, subType: 'Student Receivable' })
        .populate('studentId', 'fullName email phone profilePicture');
    }

    if (!account) {
      const error = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    const txFilter = {
      tenantId: req.tenantId,
      $or: [
        { debitAccountId: account._id },
        { creditAccountId: account._id }
      ]
    };

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
    const { Account, Receipt } = getModels(req.db);
    const { amount, debitAccountId, description, notes, date } = req.body;

    if (!amount || amount <= 0 || !debitAccountId) {
      const error = new Error('Amount and Deposit Account (Cash/Bank) are required');
      error.statusCode = 400;
      throw error;
    }

    const studentAccount = await Account.findOne({
      tenantId: req.tenantId,
      studentId: req.params.studentId,
      subType: 'Student Receivable'
    });

    if (!studentAccount) {
      const error = new Error('Student receivable account not found');
      error.statusCode = 404;
      throw error;
    }

    const transaction = await recordTransaction(req.db, req.tenantId, {
      debitAccountId, // Cash/Bank/UPI
      creditAccountId: studentAccount._id, // Student Account (Credit reduces receivable)
      amount: Number(amount),
      type: 'receipt',
      description: description || 'Student Payment Received',
      reference: notes,
      date,
      userId: req.user?._id
    });

    const receiptNumber = await genReceiptNumber(Receipt, req.tenantId);
    const receipt = await Receipt.create({
      tenantId: req.tenantId,
      receiptNumber,
      type: 'payment',
      transactionId: transaction._id,
      amount: Number(amount),
      description: description || 'Payment Received',
      date: date || new Date()
    });

    res.status(201).json({ status: 'success', data: { transaction, receipt, account: studentAccount } });
  } catch (err) { next(err); }
};

// ── Add Charge / Fine ─────────────────────────────────────────────────────────
export const addCharge = async (req, res, next) => {
  try {
    const { Account, Receipt } = getModels(req.db);
    const { amount, creditAccountId, description, notes, date, isFine } = req.body;

    if (!amount || amount <= 0 || !creditAccountId) {
      const error = new Error('Amount and Income Account (To) are required');
      error.statusCode = 400;
      throw error;
    }

    const studentAccount = await Account.findOne({
      tenantId: req.tenantId,
      studentId: req.params.studentId,
      subType: 'Student Receivable'
    });

    if (!studentAccount) {
      const error = new Error('Student receivable account not found');
      error.statusCode = 404;
      throw error;
    }

    const transaction = await recordTransaction(req.db, req.tenantId, {
      debitAccountId: studentAccount._id, // Student Account (Debit increases receivable)
      creditAccountId, // Income Account (Credit increases income)
      amount: Number(amount),
      type: isFine ? 'fee_charge' : 'fee_charge',
      description: description || (isFine ? 'Fine Charged' : 'Fee Charged'),
      reference: notes,
      date,
      userId: req.user?._id
    });

    const receiptNumber = await genReceiptNumber(Receipt, req.tenantId);
    const receipt = await Receipt.create({
      tenantId: req.tenantId,
      receiptNumber,
      type: 'fee_charge',
      transactionId: transaction._id,
      amount: Number(amount),
      description,
      date: date || new Date()
    });

    res.status(201).json({ status: 'success', data: { transaction, receipt, account: studentAccount } });
  } catch (err) { next(err); }
};

// ── Record Any Transaction ───────────────────────────────────────────────────
export const addTransaction = async (req, res, next) => {
  try {
    const transaction = await recordTransaction(req.db, req.tenantId, {
      ...req.body,
      userId: req.user?._id
    });
    res.status(201).json({ status: 'success', data: transaction });
  } catch (err) { next(err); }
};

export const addTransfer = async (req, res, next) => {
  try {
    const { amount, fromAccountId, toAccountId, description, notes, date } = req.body;

    // Transfer logic: Debit ToAccount, Credit FromAccount
    const transaction = await recordTransaction(req.db, req.tenantId, {
      debitAccountId: toAccountId,
      creditAccountId: fromAccountId,
      amount: Number(amount),
      type: 'transfer',
      description: description || 'Account Transfer',
      reference: notes,
      date,
      userId: req.user?._id
    });

    res.status(201).json({ status: 'success', data: transaction });
  } catch (err) { next(err); }
};

export const addJournalEntry = async (req, res, next) => {
  try {
    const transaction = await recordTransaction(req.db, req.tenantId, {
      ...req.body,
      type: 'journal',
      userId: req.user?._id
    });
    res.status(201).json({ status: 'success', data: transaction });
  } catch (err) { next(err); }
};

export const getInternalAccounts = async (req, res, next) => {
  try {
    const { InternalAccount } = getModels(req.db);
    const accounts = await InternalAccount.find({ tenantId: req.tenantId });

    if (accounts.length === 0) {
      const defaults = [
        { name: 'Cash in Hand', type: 'cash', isDefault: true, tenantId: req.tenantId, openingBalance: 0, currentBalance: 0 },
        { name: 'Bank Account', type: 'bank', isDefault: false, tenantId: req.tenantId, openingBalance: 0, currentBalance: 0 },
        { name: 'UPI Payments', type: 'upi', isDefault: false, tenantId: req.tenantId, openingBalance: 0, currentBalance: 0 }
      ];
      const seeded = await InternalAccount.insertMany(defaults);
      return res.status(200).json({ status: 'success', data: seeded });
    }

    res.status(200).json({ status: 'success', data: accounts });
  } catch (err) { next(err); }
};

export const addInternalAccount = async (req, res, next) => {
  try {
    const { InternalAccount } = getModels(req.db);
    const account = await InternalAccount.create({
      ...req.body,
      tenantId: req.tenantId,
      currentBalance: req.body.openingBalance || 0
    });
    res.status(201).json({ status: 'success', data: account });
  } catch (err) { next(err); }
};

// ── Get All Transactions ──────────────────────────────────────────────────────
export const getTransactions = async (req, res, next) => {
  try {
    const { Transaction } = getModels(req.db);
    const filter = { tenantId: req.tenantId };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.startDate && req.query.endDate) {
      filter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    }

    const features = new ApiFeatures(
      Transaction.find(filter)
        .populate('debitAccountId', 'name type subType')
        .populate('creditAccountId', 'name type subType')
        .sort({ date: -1 }),
      req.query
    ).paginate();

    const transactions = await features.query;
    const total = await Transaction.countDocuments(filter);

    res.status(200).json({ status: 'success', results: transactions.length, total, data: transactions });
  } catch (err) { next(err); }
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const getTrialBalance = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const accounts = await Account.find({ tenantId: req.tenantId });

    const trialBalance = accounts.map(acc => ({
      name: acc.name,
      type: acc.type,
      subType: acc.subType,
      debit: ['Assets', 'Expenses'].includes(acc.type) ? acc.currentBalance : 0,
      credit: ['Liabilities', 'Income', 'Equity'].includes(acc.type) ? acc.currentBalance : 0
    }));

    res.status(200).json({ status: 'success', data: trialBalance });
  } catch (err) { next(err); }
};

export const getProfitAndLoss = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const filter = { tenantId: req.tenantId };

    const incomeAccounts = await Account.find({ ...filter, type: 'Income' });
    const expenseAccounts = await Account.find({ ...filter, type: 'Expenses' });

    const income = incomeAccounts.map(acc => ({ name: acc.name, balance: acc.currentBalance }));
    const expenses = expenseAccounts.map(acc => ({ name: acc.name, balance: acc.currentBalance }));

    const totalIncome = income.reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);

    res.status(200).json({
      status: 'success',
      data: {
        income,
        expenses,
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses
      }
    });
  } catch (err) { next(err); }
};

export const getBalanceSheet = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const filter = { tenantId: req.tenantId };

    const assets = await Account.find({ ...filter, type: 'Assets' });
    const liabilities = await Account.find({ ...filter, type: 'Liabilities' });
    const equity = await Account.find({ ...filter, type: 'Equity' });

    const totalAssets = assets.reduce((sum, a) => sum + a.currentBalance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.currentBalance, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.currentBalance, 0);

    res.status(200).json({
      status: 'success',
      data: {
        assets: assets.map(a => ({ name: a.name, balance: a.currentBalance })),
        liabilities: liabilities.map(a => ({ name: a.name, balance: a.currentBalance })),
        equity: equity.map(a => ({ name: a.name, balance: a.currentBalance })),
        totalAssets,
        totalLiabilities,
        totalEquity,
        isBalanced: totalAssets === (totalLiabilities + totalEquity)
      }
    });
  } catch (err) { next(err); }
};

// ── Receipts ──────────────────────────────────────────────────────────────────
export const getReceipts = async (req, res, next) => {
  try {
    const { Receipt } = getModels(req.db);
    const filter = { tenantId: req.tenantId };

    const features = new ApiFeatures(
      Receipt.find(filter).sort({ date: -1 }),
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
    const receipt = await Receipt.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: 'success', data: receipt });
  } catch (err) { next(err); }
};

// ── Ensure Student Account exists ─────────────────────────────────────────────
export const ensureStudentAccount = async (db, tenantId, studentId, studentName) => {
  const { Account } = getModels(db);
  let account = await Account.findOne({ tenantId, studentId, subType: 'Student Receivable' });

  if (!account) {
    account = await Account.create({
      tenantId,
      name: `Receivable: ${studentName}`,
      type: 'Assets',
      subType: 'Student Receivable',
      studentId,
      isSystem: true,
      description: `Automated receivable account for ${studentName}`
    });
  }
  return account;
};
