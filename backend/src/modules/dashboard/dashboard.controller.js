import { getModels } from '../../utils/helpers.js';

export const getStats = async (req, res, next) => {
  try {
    const { Book, User, Borrowing } = getModels(req.db);
    
    const [totalBooks, totalUsers, activeBorrowings] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'member' }),
      Borrowing.countDocuments({ status: 'borrowed' })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalBooks,
        totalUsers,
        activeBorrowings
      }
    });
  } catch (err) {
    next(err);
  }
};
