import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';
import WhatsAppService from '../../services/whatsapp.service.js';
import Tenant from '../tenant/tenant.model.js';
import { format } from 'date-fns';

export const getAllTables = async (req, res, next) => {
  try {
    const { Table } = getModels(req.db);

    const total = await Table.countDocuments({ tenantId: req.tenantId });
    const features = new ApiFeatures(Table.find({ tenantId: req.tenantId }).populate('assignedTo', 'fullName email'), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tables = await features.query;

    res.status(200).json({
      status: 'success',
      total,
      results: tables.length,
      data: { tables }
    });
  } catch (err) { next(err); }
};

export const createTable = async (req, res, next) => {
  try {
    const { Table } = getModels(req.db);
    const table = await Table.create({ ...req.body, tenantId: req.tenantId });
    res.status(201).json({ status: 'success', data: { table } });
  } catch (err) { next(err); }
};

export const updateTable = async (req, res, next) => {
  try {
    const { Table } = getModels(req.db);
    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.status(200).json({ status: 'success', data: { table } });
  } catch (err) { next(err); }
};

export const assignTable = async (req, res, next) => {
  try {
    const { Table } = getModels(req.db);
    const { userId, validUntil, fee, deposit, notes } = req.body;

    const table = await Table.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (table.status === 'Assigned') return res.status(400).json({ message: 'Table already assigned' });

    table.assignedTo = userId;
    table.assignedDate = new Date();
    table.validUntil = validUntil;
    table.fee = fee;
    table.deposit = deposit;
    table.remarks = notes;
    table.status = 'Assigned';

    await table.save();

    const { User } = getModels(req.db);
    const user = await User.findById(userId);
    if (user) {
      const { ensureStudentAccount, getSystemAccount, recordTransaction } = await import('../ledger/finance.controller.js');
      const studentAccount = await ensureStudentAccount(req.db, req.tenantId, user._id, user.fullName);

      const tableFee = Number(fee) || 0;
      if (tableFee > 0) {
        const incomeAcc = await getSystemAccount(req.db, req.tenantId, 'Study Desk Income', 'Income', 'Service Income');
        await recordTransaction(req.db, req.tenantId, {
          debitAccountId: studentAccount._id,
          creditAccountId: incomeAcc._id,
          amount: tableFee,
          type: 'fee_charge',
          description: `Table Rental Fee (Table ${table.tableNumber})`,
          userId: req.user?._id,
          studentId: user._id
        });
      }

      const securityDeposit = Number(deposit) || 0;
      if (securityDeposit > 0) {
        const liabilityAcc = await getSystemAccount(req.db, req.tenantId, 'Security Deposits', 'Liabilities', 'Deposit');
        await recordTransaction(req.db, req.tenantId, {
          debitAccountId: studentAccount._id,
          creditAccountId: liabilityAcc._id,
          amount: securityDeposit,
          type: 'fee_charge',
          description: `Security Deposit (Table ${table.tableNumber})`,
          userId: req.user?._id,
          studentId: user._id
        });
      }
    }

    res.status(200).json({ status: 'success', data: { table } });

    // Send WhatsApp Notification
    try {
      if (user?.phone) {
        const tenant = await Tenant.findById(req.tenantId);
        const libraryName = tenant?.name || 'Library';
        const validUntilStr = table.validUntil ? format(new Date(table.validUntil), 'dd MMM yyyy') : 'N/A';
        
        const message = `📚 *Study Desk Assigned* 📚\n\nDear ${user.fullName},\n\nTable No. *${table.tableNumber}* has been assigned to you at *${libraryName}*.\n\n📅 *Valid Until:* ${validUntilStr}\n\nWe wish you a productive study session!`;
        
        await WhatsAppService.sendMessage(req.tenantId, user.phone, message);
      }
    } catch (waErr) {
      console.error('[WA] Table assignment notification failed:', waErr.message);
    }
  } catch (err) { next(err); }
};

export const unassignTable = async (req, res, next) => {
  try {
    const { Table } = getModels(req.db);
    const table = await Table.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!table) return res.status(404).json({ message: 'Table not found' });

    table.assignedTo = undefined;
    table.assignedDate = undefined;
    table.validUntil = undefined;
    table.status = 'Available';

    await table.save();

    res.status(200).json({ status: 'success', data: { table } });
  } catch (err) { next(err); }
};

export const deleteTable = async (req, res, next) => {
  try {
    const { Table } = getModels(req.db);
    const table = await Table.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
