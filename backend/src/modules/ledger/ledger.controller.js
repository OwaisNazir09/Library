import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

export const getLedgers = async (req, res, next) => {
  try {
    const { Ledger } = getModels(req.db);
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};

    const features = new ApiFeatures(Ledger.find(filter), req.query)
      .filter()
      .search(['ledgerId'])
      .sort()
      .paginate();

    features.query = features.query.populate('studentId', 'fullName email phone idNumber');

    const ledgers = await features.query;
    const total = await Ledger.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: ledgers.length,
      total,
      data: ledgers
    });
  } catch (err) {
    next(err);
  }
};

// Get single ledger with entries
export const getStudentLedger = async (req, res, next) => {
  try {
    const { Ledger, LedgerEntry } = getModels(req.db);
    const filter = req.tenantId ? { studentId: req.params.studentId, tenantId: req.tenantId } : { studentId: req.params.studentId };

    const ledger = await Ledger.findOne(filter).populate('studentId', 'fullName email phone idNumber profilePicture');
    if (!ledger) {
      const error = new Error('No ledger found for this student');
      error.statusCode = 404;
      throw error;
    }

    const entriesFilter = req.tenantId ? { ledger: ledger._id, tenantId: req.tenantId } : { ledger: ledger._id };

    // Support filtering entries by date range natively in this custom handler
    if (req.query.startDate && req.query.endDate) {
      entriesFilter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const features = new ApiFeatures(LedgerEntry.find(entriesFilter), req.query)
      .filter()
      .sort() // usually sort by date desc
      .paginate();

    const entries = await features.query;
    const totalEntries = await LedgerEntry.countDocuments(entriesFilter);

    res.status(200).json({
      status: 'success',
      data: {
        ledger,
        entries,
        totalEntries
      }
    });
  } catch (err) {
    next(err);
  }
};

// Add payment (credit)
export const addPayment = async (req, res, next) => {
  try {
    const { Ledger, LedgerEntry } = getModels(req.db);
    const { amount, paymentMode, remarks, date } = req.body;

    if (!amount || amount <= 0) {
      const error = new Error('Invalid payment amount');
      error.statusCode = 400;
      throw error;
    }

    const filter = req.tenantId ? { studentId: req.params.studentId, tenantId: req.tenantId } : { studentId: req.params.studentId };
    const ledger = await Ledger.findOne(filter);

    if (!ledger) {
      const error = new Error('Ledger not found');
      error.statusCode = 404;
      throw error;
    }

    // Logic: Payment reduces balance, increases totalPaid.
    const newBalance = ledger.balance - Number(amount);
    ledger.totalPaid += Number(amount);
    ledger.balance = newBalance;
    ledger.status = newBalance > 0 ? 'due' : 'clear';
    await ledger.save();

    const entry = await LedgerEntry.create({
      tenantId: req.tenantId || ledger.tenantId,
      ledger: ledger._id,
      studentId: ledger.studentId,
      date: date || new Date(),
      description: 'Payment Received',
      type: 'credit',
      amount: Number(amount),
      runningBalance: newBalance,
      paymentMode: paymentMode || 'cash',
      category: 'payment',
      remarks
    });

    res.status(201).json({
      status: 'success',
      data: entry
    });
  } catch (err) {
    next(err);
  }
};

// Add charge (debit)
export const addCharge = async (req, res, next) => {
  try {
    const { Ledger, LedgerEntry } = getModels(req.db);
    const { amount, description, category, date, remarks } = req.body;

    if (!amount || amount <= 0 || !description) {
      const error = new Error('Amount and description are required');
      error.statusCode = 400;
      throw error;
    }

    const filter = req.tenantId ? { studentId: req.params.studentId, tenantId: req.tenantId } : { studentId: req.params.studentId };
    const ledger = await Ledger.findOne(filter);

    if (!ledger) {
      const error = new Error('Ledger not found');
      error.statusCode = 404;
      throw error;
    }

    // Logic: Charge increases balance, increases totalFee.
    const newBalance = ledger.balance + Number(amount);
    ledger.totalFee += Number(amount);
    ledger.balance = newBalance;
    ledger.status = 'due'; // charging always makes it due unless it's a negative charge (not handled here)
    await ledger.save();

    const entry = await LedgerEntry.create({
      tenantId: req.tenantId || ledger.tenantId,
      ledger: ledger._id,
      studentId: ledger.studentId,
      date: date || new Date(),
      description,
      type: 'debit',
      amount: Number(amount),
      runningBalance: newBalance,
      paymentMode: 'other', // charges aren't 'paid' typically
      category: category || 'other',
      remarks
    });

    res.status(201).json({
      status: 'success',
      data: entry
    });
  } catch (err) {
    next(err);
  }
};

// Dashboard Stats Output
export const getLedgerStats = async (req, res, next) => {
  try {
    const { Ledger, LedgerEntry } = getModels(req.db);
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};

    // Total fees over time
    const stats = await Ledger.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$totalPaid' },
          totalPending: { $sum: { $max: [0, '$balance'] } }, // Only positive balances
          overdueCount: {
            $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
          }
        }
      }
    ]);

    // Today's collection
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayCollection = await LedgerEntry.aggregate([
      {
        $match: {
          ...filter,
          type: 'credit',
          date: { $gte: startOfToday, $lte: endOfToday }
        }
      },
      {
        $group: {
          _id: null,
          todayTotal: { $sum: '$amount' }
        }
      }
    ]);

    // Construct response
    const resultStats = stats[0] || { totalCollected: 0, totalPending: 0, overdueCount: 0 };
    resultStats.todayCollection = todayCollection[0]?.todayTotal || 0;

    res.status(200).json({
      status: 'success',
      data: resultStats
    });
  } catch (err) {
    next(err);
  }
};
