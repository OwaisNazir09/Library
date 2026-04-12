import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);
    
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};
    const features = new ApiFeatures(User.find(filter), req.query)
      .filter()
      .search(['fullName', 'email'])
      .sort()
      .limitFields()
      .paginate();
    
    const users = await features.query;

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);
    const filter = req.tenantId ? { _id: req.params.id, tenantId: req.tenantId } : { _id: req.params.id };
    const user = await User.findOne(filter);
    
    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);
    const filter = req.tenantId ? { _id: req.params.id, tenantId: req.tenantId } : { _id: req.params.id };
    const user = await User.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);
    const filter = req.tenantId ? { _id: req.params.id, tenantId: req.tenantId } : { _id: req.params.id };
    const user = await User.findOneAndDelete(filter);

    if (!user) {
      const error = new Error('No user found with that ID');
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

export const createUser = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);
    const newUser = await User.create({
      ...req.body,
      tenantId: req.tenantId
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
