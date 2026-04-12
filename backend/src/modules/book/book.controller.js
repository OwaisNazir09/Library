import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

export const getAllBooks = async (req, res, next) => {
  try {
    const { Book } = getModels(req.db);
    
    const features = new ApiFeatures(Book.find({ tenantId: req.tenantId }), req.query)
      .filter()
      .search(['title', 'author', 'isbn', 'genre'])
      .sort()
      .limitFields()
      .paginate();
    
    const books = await features.query;

    res.status(200).json({
      status: 'success',
      results: books.length,
      data: {
        books
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const { Book } = getModels(req.db);
    const newBook = await Book.create({ ...req.body, tenantId: req.tenantId });

    res.status(201).json({
      status: 'success',
      data: {
        book: newBook
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getBook = async (req, res, next) => {
  try {
    const { Book } = getModels(req.db);
    const book = await Book.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!book) {
      const error = new Error('No book found with that ID in your library');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        book
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { Book } = getModels(req.db);
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId }, 
      req.body, 
      {
        new: true,
        runValidators: true
      }
    );

    if (!book) {
      const error = new Error('No book found with that ID in your library');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        book
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { Book } = getModels(req.db);
    const book = await Book.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!book) {
      const error = new Error('No book found with that ID in your library');
      error.statusCode = 404;
      throw error;
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
