import express from 'express';
import { getAllUsers, getUser, updateUser, deleteUser, getMe, createUser } from './user.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMe, getUser);

router.use(restrictTo('admin', 'librarian'));

router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
