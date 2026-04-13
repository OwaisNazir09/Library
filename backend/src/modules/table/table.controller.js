import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

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

    res.status(200).json({ status: 'success', data: { table } });
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
