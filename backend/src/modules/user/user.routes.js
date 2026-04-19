import express from 'express';
import { getAllUsers, getUser, updateUser, deleteUser, getMe, createUser, approveRegistration, rejectRegistration } from './user.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { createUploader } from '../../middleware/upload.middleware.js';

const router = express.Router();
const upload = createUploader('users');

router.use(protect);

const userUpload = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'idPhoto', maxCount: 1 }
]);

router.get('/me', getMe, getUser);
router.patch('/update-me', getMe, userUpload, updateUser);

router.use(restrictTo('admin', 'librarian'));

router.route('/')
  .get(getAllUsers)
  .post(userUpload, createUser);

router.route('/:id')
  .get(getUser)
  .patch(userUpload, updateUser)
  .delete(deleteUser);

router.patch('/:id/approve', approveRegistration);
router.patch('/:id/reject', rejectRegistration);

export default router;
