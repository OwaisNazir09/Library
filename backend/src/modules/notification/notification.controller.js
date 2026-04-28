import { getModels } from '../../utils/helpers.js';
import { sendMulticastNotification } from '../../services/firebase.service.js';


export const sendNotification = async (req, res) => {
  try {
    const { title, body, target, libraryId, userId, data, type } = req.body;
    const { User, Notification } = getModels(req.db);

    let query = { fcmToken: { $exists: true, $ne: null } };

    if (req.user.role !== 'super_admin') {
      query.tenantId = req.user.tenantId;
      if (userId) query._id = userId;
    } else {
      if (target === 'library' && libraryId) {
        query.tenantId = libraryId;
      } else if (target === 'single' && userId) {
        query._id = userId;
      }
    }

    console.log('[Notification] Querying users with:', JSON.stringify(query));
    const users = await User.find(query).select('fcmToken tenantId');
    const tokens = users.map(u => u.fcmToken).filter(t => !!t);
    console.log(`[Notification] Found ${users.length} users, ${tokens.length} have valid tokens.`);

    const notificationPromises = users.map(user =>
      Notification.create({
        tenantId: user.tenantId,
        user: user._id,
        title,
        message: body,
        type: type || 'info'
      })
    );
    await Promise.all(notificationPromises);

    let pushResponse = { successCount: 0, failureCount: 0 };
    if (tokens.length > 0) {
      pushResponse = await sendMulticastNotification(tokens, {
        title,
        body,
        data: data || {}
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        savedCount: users.length,
        pushResponse
      }
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const { Notification } = getModels(req.db);
    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const markNotificationsAsRead = async (req, res) => {
  try {
    const { Notification } = getModels(req.db);
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
