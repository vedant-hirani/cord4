import mongoose from 'mongoose';
import env from './env.js';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    
    logger.info(`🌐 MongoDB Connected: ${conn.connection.host}`);
    
    // Mongoose Connection Event Listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB Connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB Disconnected. Attempting reconnection...');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('🌐 MongoDB Reconnected successfully.');
    });

  } catch (error) {
    logger.error(`❌ Error connecting to database: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
