import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const tenantConnections = new Map();

export const connectMainDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI + 'library_main', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Main Database connected');
  } catch (error) {
    console.error('❌ Main Database error:', error);
    process.exit(1);
  }
};

export const getTenantConnection = async (tenantId, dbName) => {
  if (tenantConnections.has(tenantId)) {
    return tenantConnections.get(tenantId);
  }

  const connection = mongoose.createConnection(
    `${process.env.MONGODB_URI}${dbName}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  tenantConnections.set(tenantId, connection);
  return connection;
};
