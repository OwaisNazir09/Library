import { getModels } from '../../utils/helpers.js';

export const getSummary = async (req, res, next) => {
  try {
    const { Book, User, Borrowing, Fine } = getModels(req.db);

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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [trendData, topBooks] = await Promise.all([
      Borrowing.aggregate([
        { $match: { ...filter, borrowDate: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $month: "$borrowDate" }, books: { $sum: 1 } } }
      ]),
      Borrowing.aggregate([
        { $match: filter },
        { $group: { _id: "$book", borrowCount: { $sum: 1 } } },
        { $sort: { borrowCount: -1 } },
        { $limit: 4 },
        { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'bookInfo' } },
        { $unwind: "$bookInfo" },
        { $project: { name: "$bookInfo.title", value: "$borrowCount" } }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mIdx = d.getMonth();
      const name = monthNames[mIdx];
      const match = trendData.find(t => t._id === mIdx + 1);
      data.push({ name, books: match ? match.books : 0 });
    }

    res.status(200).json({
      status: 'success',
      data: {
        trend: data,
        popularBooks: topBooks
      }
    });
  } catch (err) {
    next(err);
  }
};
