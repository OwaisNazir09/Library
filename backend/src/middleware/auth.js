import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { getModels } from '../utils/helpers.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('You are not logged in! Please log in to get access.');
      error.statusCode = 401;
      throw error;
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const { User } = getModels(req.db);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      const error = new Error('The user belonging to this token no longer exists.');
      error.statusCode = 401;
      throw error;
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error('You do not have permission to perform this action');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};
