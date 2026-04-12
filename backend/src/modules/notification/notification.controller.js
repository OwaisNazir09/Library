import { getModels } from '../../utils/helpers.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const { Notification } = getModels(req.db);
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ status: 'success', data: { notifications } });
  } catch (err) { next(err); }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { Notification } = getModels(req.db);
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};
