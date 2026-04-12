import { getModels } from '../../utils/helpers.js';

export const getAllTables = async (req, res, next) => {
  try {
    const { Table } = getModels(req.db);
    const tables = await Table.find({ tenantId: req.tenantId, ...req.query });
    res.status(200).json({
      status: 'success',
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

export const reserveTable = async (req, res, next) => {
    try {
        const { Table } = getModels(req.db);
        const table = await Table.findOneAndUpdate(
          { _id: req.params.id, tenantId: req.tenantId }, 
          { isReserved: true, isAvailable: false }, 
          { new: true }
        );
        res.status(200).json({ status: 'success', data: { table } });
    } catch (err) { next(err); }
};
