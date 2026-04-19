import { getModels } from '../../utils/helpers.js';
import { sendMulticastNotification } from '../../services/firebase.service.js';

/**
 * Send notification to multiple users
 * POST /api/notifications/send
 * Body: { title, body, target: 'all' | 'library', libraryId, data }
 */
export const sendNotification = async (req, res) => {
  try {
    const { title, body, target, libraryId, userId, data } = req.body;
    const { User } = getModels(req.db);

    let query = { pushToken: { $exists: true, $ne: null } };

    // 1. Permission Check
    if (req.user.role !== 'super_admin') {
      // Regular admin/librarian can only send to their own library
      query.tenantId = req.user.tenantId;
      if (userId) {
        query._id = userId;
      }
    } else {
      // Super admin logic
      if (target === 'library' && libraryId) {
        query.tenantId = libraryId;
      } else if (target === 'single' && userId) {
        query._id = userId;
      }
      // if target === 'all', query stays as is (everyone with pushToken)
    }

    const users = await User.find(query).select('pushToken');
    const tokens = users.map(u => u.pushToken);

    if (tokens.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No users with registered push tokens found for this target'
      });
    }

    const response = await sendMulticastNotification(tokens, {
      title,
      body,
      data: data || {}
    });

    res.status(200).json({
      status: 'success',
      data: {
        successCount: response.successCount,
        failureCount: response.failureCount
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
