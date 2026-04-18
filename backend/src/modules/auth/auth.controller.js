import jwt from 'jsonwebtoken';
import { getModels } from '../../utils/helpers.js';

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    role: user.role,
    tenantId: user.role === 'super_admin' ? null : (user.tenantId ? user.tenantId.toString() : null),
    data: {
      user
    }
  });
};

export const signup = async (req, res, next) => {
  try {
    console.log('[Auth] Signup attempt:', req.body);
    const { User } = getModels(req.db);
    const newUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'member'
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    console.log('[Auth] Login attempt:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Please provide email and password!');
      error.statusCode = 400;
      throw error;
    }

    const { User } = getModels(req.db);
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      const error = new Error('Incorrect email or password');
      error.statusCode = 401;
      throw error;
    }

    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
