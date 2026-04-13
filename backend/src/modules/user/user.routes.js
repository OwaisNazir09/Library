import express from 'express';
import { getAllUsers, getUser, updateUser, deleteUser, getMe, createUser } from './user.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { createUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();
const upload = createUploader('users');

router.use(protect);

router.get('/me', getMe, getUser);

router.use(restrictTo('admin', 'librarian'));

const userUpload = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'idPhoto', maxCount: 1 }
]);

router.route('/')
  .get(getAllUsers)
  .post(userUpload, createUser);

router.route('/:id')
  .get(getUser)
  .patch(userUpload, updateUser)
  .delete(deleteUser);

export default router;
