import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DB = process.env.MONGODB_URI;

const updateResources = async () => {
  try {
    await mongoose.connect(DB);
    console.log('Connected to DB...');

    // We don't have the schema here, but we can use the collection directly
    const db = mongoose.connection.db;
    const result = await db.collection('resources').updateMany(
      {}, 
      { $set: { visibility: 'global' } }
    );

    const blogResult = await db.collection('blogs').updateMany(
      {},
      { $set: { visibility: 'global', status: 'approved' } }
    );

    console.log(`Successfully updated ${result.modifiedCount} resources and ${blogResult.modifiedCount} blogs to global visibility.`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating resources:', err);
    process.exit(1);
  }
};

updateResources();
