import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserSchema from './src/modules/user/user.model.js';

dotenv.config();

const User = mongoose.model('User', UserSchema);

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database');

    const adminEmail = 'admin@bookary.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Super Admin already exists');
      process.exit(0);
    }

    const superAdmin = await User.create({
      fullName: 'Chief Administrator',
      email: adminEmail,
      password: 'admin123',
      role: 'super_admin'
    });

    console.log('Super Admin Created Successfully!');
    console.log('Email:', adminEmail);
    console.log('Password: admin123');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedSuperAdmin();
