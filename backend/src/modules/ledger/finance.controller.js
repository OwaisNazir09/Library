import mongoose from 'mongoose';
import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

// ── Ref Generator ─────────────────────────────────────────────────────────────
const genRef = async (Transaction, tenantId) => {
  const year = new Date().getFullYear();
  const count = await Transaction.countDocuments({ tenantId });
  return `TXN-${year}-${String(count + 1).padStart(6, '0')}`;
};

const genReceiptNumber = async (Receipt, tenantId) => {
  const year = new Date().getFullYear();
  const count = await Receipt.countDocuments({ tenantId });
  return `RCP-${year}-${String(count + 1).padStart(5, '0')}`;
};

export const recordTransaction = async (db, tenantId, details) => {
  const { Account, Transaction } = getModels(db);
  const { debitAccountId, creditAccountId, amount, type, description, reference, date, userId, studentId, category } = details;

  const session = await db.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const [debitAccount, creditAccount] = await Promise.all([
        Account.findOne({ _id: debitAccountId, tenantId }).session(session),
        Account.findOne({ _id: creditAccountId, tenantId }).session(session),
      ]);

      if (!debitAccount || !creditAccount) throw new Error('Debit or Credit account not found');

      const updateBalance = (acc, amt, isDebit) => {
        const isAssetOrExpense = ['Assets', 'Expenses'].includes(acc.type);
        acc.currentBalance += isAssetOrExpense ? (isDebit ? amt : -amt) : (isDebit ? -amt : amt);
      };

      updateBalance(debitAccount, amount, true);
      updateBalance(creditAccount, amount, false);

      await debitAccount.save({ session });
      await creditAccount.save({ session });

      const txRef = await genRef(Transaction, tenantId);
      const tx = await Transaction.create([{
        tenantId, debitAccountId, creditAccountId, amount, type, description,
        reference, category,
        transactionRef: txRef,
        date: date || new Date(),
        createdBy: userId,
        studentId: studentId || null,
        debitAccountBalance: debitAccount.currentBalance,
        creditAccountBalance: creditAccount.currentBalance,
      }], { session });
      result = tx[0];
    });
    return result;
  } finally {
    await session.endSession();
  }
};

// ── COA Seeder ────────────────────────────────────────────────────────────────
export const seedChartOfAccounts = async (db, tenantId) => {
  const { Account } = getModels(db);
  const defaults = [
    { name: 'Cash in Hand', type: 'Assets', subType: 'Cash' },
    { name: 'Bank Account', type: 'Assets', subType: 'Bank' },
    { name: 'UPI Payments', type: 'Assets', subType: 'UPI' },
    { name: 'Security Deposits', type: 'Liabilities', subType: 'Deposit' },
    { name: 'Advance Payments', type: 'Liabilities', subType: 'Advance' },
    { name: 'Refund Payable', type: 'Liabilities', subType: 'Payable' },
    { name: 'Membership Income', type: 'Income', subType: 'Operating Income' },
    { name: 'Registration Fees', type: 'Income', subType: 'Operating Income' },
    { name: 'Fine Income', type: 'Income', subType: 'Fine Income' },
    { name: 'Study Desk Income', type: 'Income', subType: 'Service Income' },
    { name: 'Service Income', type: 'Income', subType: 'Service Income' },
    { name: 'Rent Expense', type: 'Expenses', subType: 'Operating Expense' },
    { name: 'Salary Expense', type: 'Expenses', subType: 'Operating Expense' },
    { name: 'Electricity Expense', type: 'Expenses', subType: 'Direct Expense' },
    { name: 'Maintenance Expense', type: 'Expenses', subType: 'Direct Expense' },
  ];
  for (const acc of defaults) {
    await Account.findOneAndUpdate(
      { tenantId, name: acc.name },
      { $setOnInsert: { ...acc, tenantId, isSystem: true, isSeeded: true } },
      { upsert: true, new: true }
    );
  }
};

// ── Ensure Student Receivable Account ─────────────────────────────────────────
export const ensureStudentAccount = async (db, tenantId, studentId, studentName) => {
  const { Account } = getModels(db);
  return Account.findOneAndUpdate(
    { tenantId, studentId, subType: 'Student Receivable' },
    { $setOnInsert: { tenantId, studentId, name: `Receivable: ${studentName}`, type: 'Assets', subType: 'Student Receivable', isSystem: true } },
    { upsert: true, new: true }
  );
};

// ── Helper: get or create system account by name ──────────────────────────────
export const getSystemAccount = async (db, tenantId, name, type, subType) => {
  const { Account } = getModels(db);
  return Account.findOneAndUpdate(
    { tenantId, name },
    { $setOnInsert: { tenantId, name, type, subType, isSystem: true } },
    { upsert: true, new: true }
  );
};

// ── Finance Dashboard Stats ───────────────────────────────────────────────────
export const getFinanceStats = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const accounts = await Account.find({ tenantId: req.tenantId });
    const stats = accounts.reduce((acc, a) => {
      if (a.type === 'Assets') acc.totalAssets += a.currentBalance;
      if (a.type === 'Liabilities') acc.totalLiabilities += a.currentBalance;
      if (a.type === 'Income') acc.totalIncome += a.currentBalance;
      if (a.type === 'Expenses') acc.totalExpenses += a.currentBalance;
      if (a.subType === 'Student Receivable') acc.pendingFees += a.currentBalance;
      if (['Cash', 'Bank', 'UPI', 'Wallet'].includes(a.subType)) acc.liquidAssets += a.currentBalance;
      return acc;
    }, { totalAssets: 0, totalLiabilities: 0, totalIncome: 0, totalExpenses: 0, pendingFees: 0, liquidAssets: 0 });
    res.json({ status: 'success', data: { ...stats, netProfit: stats.totalIncome - stats.totalExpenses } });
  } catch (err) { next(err); }
};

// ── Account Management ────────────────────────────────────────────────────────
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
    res.json({ status: 'success', data: accounts });
  } catch (err) { next(err); }
};

export const addAccount = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const account = await Account.create({ ...req.body, tenantId: req.tenantId, currentBalance: req.body.openingBalance || 0 });
    res.status(201).json({ status: 'success', data: account });
  } catch (err) { next(err); }
};

// ── Student Ledger with Running Balance ───────────────────────────────────────
export const getAccountLedger = async (req, res, next) => {
  try {
    const { Account, Transaction } = getModels(req.db);
    const id = req.params.id;

    let account = await Account.findOne({ _id: id, tenantId: req.tenantId })
      .populate('studentId', 'fullName email phone profilePicture idNumber');

    if (!account) {
      account = await Account.findOne({ studentId: id, tenantId: req.tenantId, subType: 'Student Receivable' })
        .populate('studentId', 'fullName email phone profilePicture idNumber');
    }
    if (!account) return res.status(404).json({ status: 'fail', message: 'Account not found' });

    const txFilter = {
      tenantId: req.tenantId,
      $or: [{ debitAccountId: account._id }, { creditAccountId: account._id }]
    };

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      txFilter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    }
    if (req.query.type) txFilter.type = req.query.type;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const totalTransactions = await Transaction.countDocuments(txFilter);

    const allTx = await Transaction.find(txFilter)
      .populate('debitAccountId', 'name type subType')
      .populate('creditAccountId', 'name type subType')
      .sort({ date: 1, createdAt: 1 });

    // Compute server-side running balance
    let runningBalance = account.openingBalance || 0;
    const enriched = allTx.map(tx => {
      const isDebit = tx.debitAccountId?._id?.toString() === account._id.toString();
      runningBalance = isDebit ? runningBalance + tx.amount : runningBalance - tx.amount;
      return { ...tx.toObject(), runningBalance };
    });

    // Return paginated slice, newest first
    const paginated = enriched.reverse().slice(skip, skip + limit);

    res.json({ status: 'success', data: { account, transactions: paginated, totalTransactions, page, pages: Math.ceil(totalTransactions / limit) } });
  } catch (err) { next(err); }
};

// ── My Ledger (Student self-view) ─────────────────────────────────────────────
export const getMyLedger = async (req, res, next) => {
  try {
    const { Account, Transaction } = getModels(req.db);
    const account = await Account.findOne({ studentId: req.user._id, tenantId: req.tenantId, subType: 'Student Receivable' })
      .populate('studentId', 'fullName email phone');
    if (!account) return res.json({ status: 'success', data: { account: null, transactions: [], totalTransactions: 0 } });

    const txFilter = { tenantId: req.tenantId, $or: [{ debitAccountId: account._id }, { creditAccountId: account._id }] };
    const allTx = await Transaction.find(txFilter)
      .populate('debitAccountId', 'name type').populate('creditAccountId', 'name type')
      .sort({ date: 1 });

    let runningBalance = account.openingBalance || 0;
    const enriched = allTx.map(tx => {
      const isDebit = tx.debitAccountId?._id?.toString() === account._id.toString();
      runningBalance = isDebit ? runningBalance + tx.amount : runningBalance - tx.amount;
      return { ...tx.toObject(), runningBalance };
    });

    res.json({ status: 'success', data: { account, transactions: enriched.reverse(), totalTransactions: enriched.length } });
  } catch (err) { next(err); }
};

// ── Add Payment (Student pays) ────────────────────────────────────────────────
export const addPayment = async (req, res, next) => {
  try {
    const { Account, Receipt } = getModels(req.db);
    const { amount, debitAccountId, description, notes, date } = req.body;
    if (!amount || amount <= 0 || !debitAccountId) return res.status(400).json({ status: 'fail', message: 'Amount and deposit account required' });

    const studentAccount = await Account.findOne({ tenantId: req.tenantId, studentId: req.params.studentId, subType: 'Student Receivable' });
    if (!studentAccount) return res.status(404).json({ status: 'fail', message: 'Student account not found' });

    const tx = await recordTransaction(req.db, req.tenantId, {
      debitAccountId, creditAccountId: studentAccount._id,
      amount: Number(amount), type: 'receipt',
      description: description || 'Payment Received',
      reference: notes, date,
      userId: req.user?._id, studentId: studentAccount.studentId,
    });

    const rcp = await Receipt.create({
      tenantId: req.tenantId, receiptNumber: await genReceiptNumber(Receipt, req.tenantId),
      type: 'payment', transactionId: tx._id, studentId: studentAccount.studentId,
      amount: Number(amount), description: description || 'Payment Received', date: date || new Date()
    });

    res.status(201).json({ status: 'success', data: { transaction: tx, receipt: rcp } });
  } catch (err) { next(err); }
};

// ── Add Charge / Fine ─────────────────────────────────────────────────────────
export const addCharge = async (req, res, next) => {
  try {
    const { Account, Receipt } = getModels(req.db);
    const { amount, creditAccountId, description, notes, date } = req.body;
    if (!amount || amount <= 0 || !creditAccountId) return res.status(400).json({ status: 'fail', message: 'Amount and income account required' });

    const studentAccount = await Account.findOne({ tenantId: req.tenantId, studentId: req.params.studentId, subType: 'Student Receivable' });
    if (!studentAccount) return res.status(404).json({ status: 'fail', message: 'Student account not found' });

    const tx = await recordTransaction(req.db, req.tenantId, {
      debitAccountId: studentAccount._id, creditAccountId,
      amount: Number(amount), type: 'fee_charge',
      description: description || 'Charge Applied',
      reference: notes, date,
      userId: req.user?._id, studentId: studentAccount.studentId,
    });

    const rcp = await Receipt.create({
      tenantId: req.tenantId, receiptNumber: await genReceiptNumber(Receipt, req.tenantId),
      type: 'fee_charge', transactionId: tx._id, studentId: studentAccount.studentId,
      amount: Number(amount), description, date: date || new Date()
    });

    res.status(201).json({ status: 'success', data: { transaction: tx, receipt: rcp } });
  } catch (err) { next(err); }
};

// ── Refund / Reversal ─────────────────────────────────────────────────────────
export const addRefund = async (req, res, next) => {
  try {
    const { Account, Transaction, Receipt } = getModels(req.db);
    const { amount, description, notes, date, originalTransactionId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ status: 'fail', message: 'Valid amount required' });

    const studentAccount = await Account.findOne({ tenantId: req.tenantId, studentId: req.params.studentId, subType: 'Student Receivable' });
    if (!studentAccount) return res.status(404).json({ status: 'fail', message: 'Student account not found' });

    // Refund: Debit the Income account, Credit the Student Receivable (reduces their balance)
    // Also debit cash to refund physically means: Debit Student Receivable, Credit Cash
    // Standard refund = reverse the original charge
    const tx = await recordTransaction(req.db, req.tenantId, {
      debitAccountId: studentAccount._id,   // reduces balance due to student
      creditAccountId: studentAccount._id,  // We need a cash account — use body param
      amount: Number(amount), type: 'refund',
      description: description || 'Refund Issued',
      reference: notes, date,
      userId: req.user?._id, studentId: studentAccount.studentId,
    });

    // Mark original tx as reversed if provided
    if (originalTransactionId) {
      await Transaction.findByIdAndUpdate(originalTransactionId, { isReversed: true, reversalOf: tx._id });
    }

    const rcp = await Receipt.create({
      tenantId: req.tenantId, receiptNumber: await genReceiptNumber(Receipt, req.tenantId),
      type: 'refund', transactionId: tx._id, studentId: studentAccount.studentId,
      amount: Number(amount), description, date: date || new Date()
    });

    res.status(201).json({ status: 'success', data: { transaction: tx, receipt: rcp } });
  } catch (err) { next(err); }
};

// ── Proper Refund (Debit income → Credit cash, reduces student balance) ───────
export const issueRefund = async (req, res, next) => {
  try {
    const { Account, Transaction, Receipt } = getModels(req.db);
    const { amount, cashAccountId, incomeAccountId, description, date, originalTransactionId } = req.body;
    if (!amount || !cashAccountId || !incomeAccountId) {
      return res.status(400).json({ status: 'fail', message: 'amount, cashAccountId and incomeAccountId required' });
    }
    const studentAccount = await Account.findOne({ tenantId: req.tenantId, studentId: req.params.studentId, subType: 'Student Receivable' });
    if (!studentAccount) return res.status(404).json({ status: 'fail', message: 'Student account not found' });

    // Debit income (reduces income), Credit cash (reduces cash to student)
    const tx = await recordTransaction(req.db, req.tenantId, {
      debitAccountId: incomeAccountId,
      creditAccountId: cashAccountId,
      amount: Number(amount), type: 'refund',
      description: description || 'Refund Issued',
      date, userId: req.user?._id, studentId: studentAccount.studentId,
    });

    if (originalTransactionId) {
      await Transaction.findByIdAndUpdate(originalTransactionId, { isReversed: true });
    }

    const rcp = await Receipt.create({
      tenantId: req.tenantId, receiptNumber: await genReceiptNumber(Receipt, req.tenantId),
      type: 'refund', transactionId: tx._id, studentId: studentAccount.studentId,
      amount: Number(amount), description, date: date || new Date()
    });

    res.status(201).json({ status: 'success', data: { transaction: tx, receipt: rcp } });
  } catch (err) { next(err); }
};

// ── Add Expense ───────────────────────────────────────────────────────────────
export const addExpense = async (req, res, next) => {
  try {
    const { Receipt } = getModels(req.db);
    const { amount, expenseAccountId, cashAccountId, description, notes, date, category } = req.body;
    if (!amount || !expenseAccountId || !cashAccountId) {
      return res.status(400).json({ status: 'fail', message: 'amount, expenseAccountId and cashAccountId required' });
    }
    const tx = await recordTransaction(req.db, req.tenantId, {
      debitAccountId: expenseAccountId,   // Debit expense
      creditAccountId: cashAccountId,     // Credit cash/bank
      amount: Number(amount), type: 'expense',
      description: description || 'Operational Expense',
      reference: notes, date, category,
      userId: req.user?._id,
    });
    const rcp = await Receipt.create({
      tenantId: req.tenantId, receiptNumber: await genReceiptNumber(Receipt, req.tenantId),
      type: 'expense', transactionId: tx._id,
      amount: Number(amount), description, date: date || new Date()
    });
    res.status(201).json({ status: 'success', data: { transaction: tx, receipt: rcp } });
  } catch (err) { next(err); }
};

// ── Generic Transaction / Journal / Transfer ──────────────────────────────────
export const addTransaction = async (req, res, next) => {
  try { res.status(201).json({ status: 'success', data: await recordTransaction(req.db, req.tenantId, { ...req.body, userId: req.user?._id }) }); }
  catch (err) { next(err); }
};
export const addJournalEntry = async (req, res, next) => {
  try { res.status(201).json({ status: 'success', data: await recordTransaction(req.db, req.tenantId, { ...req.body, type: 'journal', userId: req.user?._id }) }); }
  catch (err) { next(err); }
};
export const addTransfer = async (req, res, next) => {
  try {
    const { amount, fromAccountId, toAccountId, description, notes, date } = req.body;
    res.status(201).json({ status: 'success', data: await recordTransaction(req.db, req.tenantId, { debitAccountId: toAccountId, creditAccountId: fromAccountId, amount: Number(amount), type: 'transfer', description: description || 'Transfer', reference: notes, date, userId: req.user?._id }) });
  } catch (err) { next(err); }
};

// ── Seed COA endpoint ─────────────────────────────────────────────────────────
export const seedAccounts = async (req, res, next) => {
  try {
    await seedChartOfAccounts(req.db, req.tenantId);
    res.json({ status: 'success', message: 'Chart of Accounts seeded successfully' });
  } catch (err) { next(err); }
};

// ── Get All Transactions ──────────────────────────────────────────────────────
export const getTransactions = async (req, res, next) => {
  try {
    const { Transaction } = getModels(req.db);
    const filter = { tenantId: req.tenantId };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.studentId) filter.studentId = req.query.studentId;
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
    const [transactions, total] = await Promise.all([features.query, Transaction.countDocuments(filter)]);
    res.json({ status: 'success', results: transactions.length, total, data: transactions });
  } catch (err) { next(err); }
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const getTrialBalance = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const accounts = await Account.find({ tenantId: req.tenantId });
    const data = accounts.map(a => ({
      name: a.name, type: a.type, subType: a.subType,
      debit: ['Assets', 'Expenses'].includes(a.type) ? a.currentBalance : 0,
      credit: ['Liabilities', 'Income', 'Equity'].includes(a.type) ? a.currentBalance : 0,
    }));
    const totalDebit = data.reduce((s, a) => s + a.debit, 0);
    const totalCredit = data.reduce((s, a) => s + a.credit, 0);
    res.json({ status: 'success', data: { accounts: data, totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 } });
  } catch (err) { next(err); }
};

export const getProfitAndLoss = async (req, res, next) => {
  try {
    const { Account, Transaction } = getModels(req.db);
    const filter = { tenantId: req.tenantId };
    const txFilter = { tenantId: req.tenantId };
    if (req.query.startDate && req.query.endDate) {
      txFilter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    }
    const [income, expenses] = await Promise.all([
      Account.find({ ...filter, type: 'Income' }),
      Account.find({ ...filter, type: 'Expenses' }),
    ]);
    const totalIncome = income.reduce((s, a) => s + a.currentBalance, 0);
    const totalExpenses = expenses.reduce((s, a) => s + a.currentBalance, 0);
    res.json({
      status: 'success', data: {
        income: income.map(a => ({ name: a.name, subType: a.subType, balance: a.currentBalance })),
        expenses: expenses.map(a => ({ name: a.name, subType: a.subType, balance: a.currentBalance })),
        totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses
      }
    });
  } catch (err) { next(err); }
};

export const getBalanceSheet = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const f = { tenantId: req.tenantId };
    const [assets, liabilities, equity] = await Promise.all([
      Account.find({ ...f, type: 'Assets' }),
      Account.find({ ...f, type: 'Liabilities' }),
      Account.find({ ...f, type: 'Equity' }),
    ]);
    const totalAssets = assets.reduce((s, a) => s + a.currentBalance, 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + a.currentBalance, 0);
    const totalEquity = equity.reduce((s, a) => s + a.currentBalance, 0);
    res.json({
      status: 'success', data: {
        assets: assets.map(a => ({ name: a.name, balance: a.currentBalance })),
        liabilities: liabilities.map(a => ({ name: a.name, balance: a.currentBalance })),
        equity: equity.map(a => ({ name: a.name, balance: a.currentBalance })),
        totalAssets, totalLiabilities, totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
      }
    });
  } catch (err) { next(err); }
};

// ── Receipts ──────────────────────────────────────────────────────────────────
export const getReceipts = async (req, res, next) => {
  try {
    const { Receipt } = getModels(req.db);
    const filter = { tenantId: req.tenantId };
    if (req.query.studentId) filter.studentId = req.query.studentId;
    const features = new ApiFeatures(Receipt.find(filter).sort({ date: -1 }), req.query).paginate();
    const [receipts, total] = await Promise.all([features.query, Receipt.countDocuments(filter)]);
    res.json({ status: 'success', results: receipts.length, total, data: receipts });
  } catch (err) { next(err); }
};
export const getReceipt = async (req, res, next) => {
  try {
    const { Receipt } = getModels(req.db);
    const r = await Receipt.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!r) return res.status(404).json({ status: 'fail', message: 'Receipt not found' });
    res.json({ status: 'success', data: r });
  } catch (err) { next(err); }
};

// ── Internal / Backward Compat ────────────────────────────────────────────────
export const getInternalAccounts = async (req, res, next) => {
  try {
    const { Account } = getModels(req.db);
    const accounts = await Account.find({ tenantId: req.tenantId, type: 'Assets', subType: { $in: ['Cash', 'Bank', 'UPI', 'Wallet'] } });
    if (accounts.length === 0) {
      await seedChartOfAccounts(req.db, req.tenantId);
      return getInternalAccounts(req, res, next);
    }
    res.json({ status: 'success', data: accounts });
  } catch (err) { next(err); }
};
export const addInternalAccount = addAccount;
