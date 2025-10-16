/**
 * MongoDB Database Connection
 * 
 * Handles connection to MongoDB with connection pooling
 */

import mongoose from 'mongoose';
import { env } from './env';

// Track connection status
let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const db = await mongoose.connect(env.mongodbUri);
    
    isConnected = db.connections[0].readyState === 1;
    
    console.log('✅ MongoDB connected successfully');
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
  isConnected = false;
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

