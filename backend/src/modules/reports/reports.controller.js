import { getModels } from '../../utils/helpers.js';
import Fine from '../fines/fine.model.js';

export const getSummary = async (req, res, next) => {
  try {
    const { Book, User, Borrowing } = getModels(req.db);
    
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};

    const [totalBooksRaw, issuedBooks, activeStudents, fines] = await Promise.all([
      Book.find(filter),
      Borrowing.countDocuments({ ...filter, status: 'borrowed' }),
      User.countDocuments({ ...filter, role: 'member', isActive: true }),
      Fine.find({ ...filter, status: 'paid' })
    ]);

    const totalBooks = totalBooksRaw.reduce((acc, curr) => acc + (curr.totalCopies || 1), 0);
    const revenue = fines.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.status(200).json({
      status: 'success',
      data: {
        totalBooks,
        issuedBooks,
        activeStudents,
        revenue
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const { Borrowing } = getModels(req.db);
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};

    // Six months analytics mock query logic (or aggregation)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map(name => ({
      name,
      books: Math.floor(Math.random() * 200) + 50 // Mocking data for now as exact group by month in Mongoose gets complex without dates in DB
    }));

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (err) {
    next(err);
  }
};
