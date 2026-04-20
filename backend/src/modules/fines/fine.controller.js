import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

export const getFines = async (req, res, next) => {
  try {
    const { Fine } = getModels(req.db);
    const filter = { tenantId: req.tenantId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.student) filter.student = req.query.student;

    const features = new ApiFeatures(Fine.find(filter), req.query).filter().sort().paginate();
    features.query = features.query
      .populate('student', 'fullName email')
      .populate('issue', 'borrowedDate dueDate book');

    const [fines, total] = await Promise.all([features.query, Fine.countDocuments(filter)]);
    res.json({ status: 'success', results: fines.length, total, data: { fines } });
  } catch (err) { next(err); }
};

export const createFine = async (req, res, next) => {
  try {
    const { Fine } = getModels(req.db);
    const fine = await Fine.create({ ...req.body, tenantId: req.tenantId });
    res.status(201).json({ status: 'success', data: fine });
  } catch (err) { next(err); }
};

// ── Pay Fine — creates ledger entry: Debit Cash → Credit Student Receivable ──
export const payFine = async (req, res, next) => {
  try {
    const { Fine, User, Account } = getModels(req.db);
    const { cashAccountId } = req.body; // Which asset account received the cash

    const fine = await Fine.findOne({ _id: req.params.id, tenantId: req.tenantId }).populate('student');
    if (!fine) return res.status(404).json({ status: 'fail', message: 'Fine not found' });
    if (fine.status === 'paid') return res.status(400).json({ status: 'fail', message: 'Fine already paid' });

    fine.status = 'paid';
    fine.paidAt = new Date();
    fine.paidVia = cashAccountId || null;
    await fine.save();

    // ── Ledger: Debit Cash/Bank → Credit Student Receivable ──────────────────
    try {
      const { ensureStudentAccount, getSystemAccount, recordTransaction } = await import('../ledger/finance.controller.js');

      const student = fine.student || await User.findById(fine.student).select('fullName');
      const studentName = student?.fullName || 'Member';

      const studentAccount = await ensureStudentAccount(req.db, req.tenantId, fine.student?._id || fine.student, studentName);

      // Use provided cashAccountId or fall back to 'Cash in Hand'
      const debitAccount = cashAccountId
        ? await Account.findOne({ _id: cashAccountId, tenantId: req.tenantId })
        : await getSystemAccount(req.db, req.tenantId, 'Cash in Hand', 'Assets', 'Cash');

      if (debitAccount) {
        await recordTransaction(req.db, req.tenantId, {
          debitAccountId:  debitAccount._id,
          creditAccountId: studentAccount._id,
          amount: fine.amount, type: 'fine_payment',
          description: `Fine Payment Received — Ref: FINE-${fine._id}`,
          reference: `FINE-${fine._id}`,
          userId: req.user?._id,
          studentId: fine.student?._id || fine.student,
        });
      }
    } catch (ledgerErr) {
      console.error('[Ledger] Fine payment ledger entry failed:', ledgerErr.message);
    }

    res.json({ status: 'success', data: fine });
  } catch (err) { next(err); }
};
