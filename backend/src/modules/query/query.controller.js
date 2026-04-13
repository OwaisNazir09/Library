import Query from './query.model.js';
import ApiFeatures from '../../utils/apiFeatures.js';

export const createQuery = async (req, res, next) => {
  try {
    const newQuery = await Query.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Thank you! Our admin will contact you soon.',
      data: {
        query: newQuery
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllQueries = async (req, res, next) => {
  try {
    const features = new ApiFeatures(Query.find(), req.query)
      .filter()
      .search(['fullName', 'phone', 'email'])
      .sort()
      .limitFields()
      .paginate();

    const queries = await features.query;

    res.status(200).json({
      status: 'success',
      results: queries.length,
      data: {
        queries
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateQueryStatus = async (req, res, next) => {
  try {
    const query = await Query.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      new: true,
      runValidators: true
    });

    if (!query) {
      const error = new Error('No query found with that ID');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        query
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteQuery = async (req, res, next) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);

    if (!query) {
      const error = new Error('No query found with that ID');
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
