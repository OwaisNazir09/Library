import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getModels } from '../utils/helpers.js';

dotenv.config({ path: './.env' });

const createSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    const { User } = getModels(mongoose.connection);

    const adminEmail = 'superadmin@welib.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Super admin already exists. Updating role...');
      existingAdmin.role = 'super_admin';
      existingAdmin.status = 'approved';
      await existingAdmin.save();
      console.log('Super admin updated successfully.');
    } else {
      console.log('Creating new super admin...');
      await User.create({
        fullName: 'Super Admin',
        email: adminEmail,
        password: 'password123', // User should change this later
        role: 'super_admin',
        status: 'approved',
        userType: 'Other'
      });
      console.log('Super admin created successfully.');
      console.log('Email: superadmin@welib.com');
      console.log('Password: password123');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();
