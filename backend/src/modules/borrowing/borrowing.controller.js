import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

export const borrowBook = async (req, res, next) => {
  try {
    const { Book, Borrowing, User } = getModels(req.db);
    const { bookId } = req.body;
    const userId = req.user._id;

    const book = await Book.findOne({ _id: bookId, tenantId: req.tenantId });
    if (!book || book.availableCopies <= 0) {
      const error = new Error('Book not available for borrowing');
      error.statusCode = 400;
      throw error;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrowing = await Borrowing.create({
      user: userId,
      book: bookId,
      dueDate,
      tenantId: req.tenantId
    });

    // 3) Update book availability
    book.availableCopies -= 1;
    await book.save();

    // 4) Update user total borrowed
    await User.findByIdAndUpdate(userId, { $inc: { totalBorrowed: 1 } });

    res.status(201).json({
      status: 'success',
      data: {
        borrowing
      }
    });
  } catch (err) {
    next(err);
  }
};

export const returnBook = async (req, res, next) => {
  try {
    const { Book, Borrowing } = getModels(req.db);
    const borrowingId = req.params.id;

    const borrowing = await Borrowing.findOne({ _id: borrowingId, tenantId: req.tenantId });
    if (!borrowing || borrowing.status === 'returned') {
      const error = new Error('Invalid borrowing record or already returned');
      error.statusCode = 400;
      throw error;
    }

    borrowing.status = 'returned';
    borrowing.returnedDate = new Date();

    if (borrowing.returnedDate > borrowing.dueDate) {
      const diffTime = Math.abs(borrowing.returnedDate - borrowing.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      borrowing.fine = diffDays * 10;
    }
    await borrowing.save();

    await Book.findOneAndUpdate({ _id: borrowing.book, tenantId: req.tenantId }, { $inc: { availableCopies: 1 } });

    res.status(200).json({
      status: 'success',
      data: {
        borrowing
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getUserBorrowings = async (req, res, next) => {
  try {
    const { Borrowing } = getModels(req.db);
    const filter = { user: req.params.userId };
    if (req.tenantId) filter.tenantId = req.tenantId;

    const features = new ApiFeatures(Borrowing.find(filter).populate('book'), req.query)
      .filter()
      .sort()
      .paginate();

    const borrowings = await features.query;

    res.status(200).json({
      status: 'success',
      results: borrowings.length,
      data: {
        borrowings
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getOverdueBooks = async (req, res, next) => {
  try {
    const { Borrowing } = getModels(req.db);
    const today = new Date();
    const overdue = await Borrowing.find({
      tenantId: req.tenantId,
      status: 'borrowed',
      dueDate: { $lt: today }
    }).populate('user book');

    res.status(200).json({
      status: 'success',
      results: overdue.length,
      data: {
        overdue
      }
    });
  } catch (err) {
    next(err);
  }
};
