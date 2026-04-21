import cron from 'node-cron';
import Tenant from '../modules/tenant/tenant.model.js';

const checkSubscriptionExpiry = async () => {
  try {
    console.log('Running daily subscription expiry check...');
    
    const today = new Date();
    
    // Find all active/trial tenants whose expiry date has passed
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

// Run every day at midnight
export const initSubscriptionCron = () => {
  cron.schedule('0 0 * * *', checkSubscriptionExpiry);
  console.log('Subscription expiry cron initialized.');
  
  // Also run once on startup
  checkSubscriptionExpiry();
};
