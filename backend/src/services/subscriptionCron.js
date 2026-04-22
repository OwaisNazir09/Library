import cron from 'node-cron';
import mongoose from 'mongoose';
import Tenant from '../modules/tenant/tenant.model.js';
import { getModels } from '../utils/helpers.js';
import sendEmail from '../utils/emailService.js';
import { sendPushNotification } from './firebase.service.js';

const checkSubscriptionExpiry = async () => {
  try {
    console.log('Running daily tenant subscription expiry check...');

    const today = new Date();

    const expiredTenants = await Tenant.updateMany(
      {
        status: { $in: ['active', 'trial'] },
        expiryDate: { $lt: today }
      },
      {
        $set: { status: 'expired' }
      }
    );

    console.log(`Updated ${expiredTenants.modifiedCount} tenants to expired status.`);
  } catch (error) {
    console.error('Error in subscription expiry cron:', error);
  }
};

const checkUserMembershipExpiry = async () => {
  try {
    console.log('Running daily user membership expiry check...');
    const { User, Notification } = getModels(mongoose.connection);

    const today = new Date();
    const threeDaysFromNowStart = new Date();
    threeDaysFromNowStart.setDate(today.getDate() + 3);
    threeDaysFromNowStart.setHours(0, 0, 0, 0);

    const threeDaysFromNowEnd = new Date();
    threeDaysFromNowEnd.setDate(today.getDate() + 3);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999);

    const expiringUsers = await User.find({
      role: 'member',
      subscriptionStatus: 'active',
      packageEndDate: {
        $gte: threeDaysFromNowStart,
        $lte: threeDaysFromNowEnd
      }
    }).populate('tenantId');

    console.log(`Found ${expiringUsers.length} users with memberships expiring in 3 days.`);

    for (const user of expiringUsers) {
      const libraryName = user.tenantId?.name || 'Your Library';
      const expiryDateStr = user.packageEndDate.toLocaleDateString();

      await Notification.create({
        tenantId: user.tenantId?._id,
        user: user._id,
        title: 'Membership Expiring Soon',
        message: `Your membership at ${libraryName} is expiring on ${expiryDateStr}. Please renew to continue enjoying our services.`,
        type: 'warning'
      });

      try {
        await sendEmail({
          email: user.email,
          subject: 'Action Required: Membership Expiring Soon',
          message: `Dear ${user.fullName},\n\nYour membership at ${libraryName} is set to expire on ${expiryDateStr}.\n\nPlease visit the library or use our app to renew your package.\n\nBest regards,\n${libraryName} Team`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #e67e22;">Membership Expiring Soon</h2>
              <p>Dear <strong>${user.fullName}</strong>,</p>
              <p>This is a reminder that your membership at <strong>${libraryName}</strong> will expire on <strong>${expiryDateStr}</strong>.</p>
              <p>To avoid any interruption in services, please renew your package at your earliest convenience.</p>
              <br>
              <p>Best regards,<br><strong>${libraryName} Team</strong></p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error(`Failed to send expiry email to ${user.email}:`, emailErr);
      }

      if (user.fcmToken) {
        try {
          await sendPushNotification(user.fcmToken, {
            title: 'Membership Expiring Soon',
            body: `Your membership expires on ${expiryDateStr}. Renew now!`
          });
        } catch (pushErr) {
          console.error(`Failed to send push notification to user ${user._id}:`, pushErr);
        }
      }
    }

    const expiredUsers = await User.updateMany(
      {
        role: 'member',
        subscriptionStatus: 'active',
        packageEndDate: { $lt: today }
      },
      {
        $set: { subscriptionStatus: 'expired' }
      }
    );
    console.log(`Updated ${expiredUsers.modifiedCount} users to expired status.`);

  } catch (error) {
    console.error('Error in user membership expiry check:', error);
  }
};

export const initSubscriptionCron = () => {
  cron.schedule('0 0 * * *', () => {
    checkSubscriptionExpiry();
    checkUserMembershipExpiry();
  });
  console.log('Subscription & Membership expiry crons initialized.');
  checkSubscriptionExpiry();
  checkUserMembershipExpiry();
};
