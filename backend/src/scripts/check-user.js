import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const userSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: false },
  fullName: String,
  role: String,
  tenantId: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model('User', userSchema);

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'admin@ccc.cc';
    const user = await User.findOne({ email }).select('+password');

    if (user) {
      console.log('User found:', user.email);
      console.log('Role:', user.role);
      console.log('Has Password:', !!user.password);
      
      // Reset password to 'password123' if requested (optional)
      const bcrypt = await import('bcryptjs');
      user.password = await bcrypt.default.hash('password123', 12);
      await user.save();
      console.log('Password reset to password123 for', email);
    } else {
      console.log('User not found:', email);
      
      // Create it
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('password123', 12);
      await User.create({
        email,
        password: hashedPassword,
        fullName: 'Admin User',
        role: 'admin'
      });
      console.log('Created user admin@ccc.cc with password password123');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
