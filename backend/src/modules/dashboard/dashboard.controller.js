import { getModels } from '../../utils/helpers.js';

export const getStats = async (req, res, next) => {
  try {
    const { Book, User, Borrowing, Table, Resource } = getModels(req.db);
    
    const [
      totalBooks, 
      totalUsers, 
      activeBorrowings, 
      totalTables, 
      availableTables, 
      assignedTables, 
      expiredTables,
      totalResources,
      globalResources,
      libraryResources
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'member' }),
      Borrowing.countDocuments({ status: 'borrowed' }),
      Table.countDocuments(),
      Table.countDocuments({ status: 'Available' }),
      Table.countDocuments({ status: 'Assigned' }),
      Table.countDocuments({ status: 'Expired' }),
      Resource.countDocuments({ $or: [{ tenantId: req.tenantId }, { visibility: 'global' }] }),
      Resource.countDocuments({ visibility: 'global' }),
      Resource.countDocuments({ tenantId: req.tenantId, visibility: 'library' })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalBooks,
        totalUsers,
        activeBorrowings,
        tables: {
          total: totalTables,
          available: availableTables,
          assigned: assignedTables,
          expired: expiredTables
        },
        resources: {
          total: totalResources,
          global: globalResources,
          library: libraryResources
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
