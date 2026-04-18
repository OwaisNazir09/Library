import mongoose from 'mongoose';
import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

export const borrowBook = async (req, res, next) => {
  try {
    const { Book, Borrowing, User } = getModels(req.db);
    const { bookId, userId, borrowedDate, dueDate, finePerDay } = req.body;

    const book = await Book.findOne({ _id: bookId, tenantId: req.tenantId });
    if (!book || book.availableCopies <= 0) {
      const error = new Error('Book not available for borrowing');
      error.statusCode = 400;
      throw error;
    }

    const borrowing = await Borrowing.create({
      user: userId || req.user._id,
      book: bookId,
      borrowedDate: borrowedDate || new Date(),
      dueDate,
      finePerDay: finePerDay || 0,
      tenantId: req.tenantId
    });

    book.availableCopies -= 1;
    await book.save();

    await User.findByIdAndUpdate(userId || req.user._id, { $inc: { totalBorrowed: 1 } });

    res.status(201).json({
      status: 'success',
      data: { borrowing }
    });
  } catch (err) {
    next(err);
  }
};

export const returnBook = async (req, res, next) => {
  try {
    const { Book, Borrowing, Fine, User } = getModels(req.db);
    const borrowingId = req.params.id;

    const borrowing = await Borrowing.findOne({ _id: borrowingId, tenantId: req.tenantId });
    if (!borrowing || borrowing.status === 'returned') {
      const error = new Error('Invalid borrowing record or already returned');
      error.statusCode = 400;
      throw error;
    }

    const returnedDate = new Date();
    borrowing.status = 'returned';
    borrowing.returnedDate = returnedDate;

    if (returnedDate > borrowing.dueDate) {
      const diffTime = Math.abs(returnedDate - borrowing.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        const amount = diffDays * (borrowing.finePerDay || 10);
        borrowing.fineAmount = amount;
        borrowing.lateDays = diffDays;

        await Fine.create({
          tenantId: req.tenantId,
          student: borrowing.user,
          issue: borrowing._id,
          amount,
          status: 'unpaid'
        });

        await User.findByIdAndUpdate(borrowing.user, { $inc: { totalFines: amount } });
      }
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

export const getMyBorrowings = async (req, res, next) => {
  try {
    const { Borrowing } = getModels(req.db);
    const filter = { user: req.user._id };
    if (req.tenantId) filter.tenantId = req.tenantId;

    const borrowings = await Borrowing.find(filter).populate('book').sort({ borrowedDate: -1 });

    res.status(200).json({
      status: 'success',
      results: borrowings.length,
      data: { borrowings }
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


export const getAllBorrowings = async (req, res, next) => {
  try {
    const { Borrowing } = getModels(req.db);
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};

    const features = new ApiFeatures(Borrowing.find(filter), req.query)
      .filter()
      .sort({ createdAt: 1 })
      .paginate();

    features.query = features.query
      .populate('user', 'fullName name _id email role')
      .populate('book', 'title isbn availableCopies _id');

    const borrowings = await features.query;
    const total = await Borrowing.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: borrowings.length,
      total,
      data: {
        borrowings
      }
    });
  } catch (err) {
    next(err);
  }
};
