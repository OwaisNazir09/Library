import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';
import Package from '../package/package.model.js';
import { addDays } from 'date-fns';

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
    
    features.query = features.query.populate('package');
    const users = await features.query;

    // Auto-calculate expiration for returned users
    const updatedUsers = users.map(user => {
      if (user.packageEndDate && new Date(user.packageEndDate) < new Date() && user.subscriptionStatus === 'active') {
        user.subscriptionStatus = 'expired';
        user.save(); // Save in background
      }
      return user;
    });

    res.status(200).json({
      status: 'success',
      results: updatedUsers.length,
      data: {
        users: updatedUsers
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
    const user = await User.findOne(filter).populate('package');
    
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

    // If package is being assigned/changed
    if (req.body.package) {
      const pkg = await Package.findById(req.body.package);
      if (pkg) {
        req.body.packageStartDate = new Date();
        req.body.packageEndDate = addDays(new Date(), pkg.duration);
        req.body.subscriptionStatus = 'active';
      }
    }

    const user = await User.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    }).populate('package');

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
    
    // If package is being assigned
    if (req.body.package) {
      const pkg = await Package.findById(req.body.package);
      if (pkg) {
        req.body.packageStartDate = new Date();
        req.body.packageEndDate = addDays(new Date(), pkg.duration);
        req.body.subscriptionStatus = 'active';
      }
    }

    const newUser = await User.create({
      ...req.body,
      tenantId: req.tenantId,
      password: req.body.password || 'password123' // Default password for registered students
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
