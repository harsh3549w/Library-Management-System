import mongoose from 'mongoose';

/**
 * Database connection with production optimizations
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Production optimizations
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

/**
 * Create database indexes for better performance
 */
export const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    
    // Book indexes
    await db.collection('books').createIndex({ title: 1 });
    await db.collection('books').createIndex({ author: 1 });
    await db.collection('books').createIndex({ genre: 1 });
    await db.collection('books').createIndex({ availability: 1 });
    await db.collection('books').createIndex({ isbn: 1 }, { unique: true, sparse: true });
    
    // Borrow indexes
    await db.collection('borrows').createIndex({ userId: 1 });
    await db.collection('borrows').createIndex({ bookId: 1 });
    await db.collection('borrows').createIndex({ dueDate: 1 });
    await db.collection('borrows').createIndex({ status: 1 });
    
    // Reservation indexes
    await db.collection('reservations').createIndex({ userId: 1 });
    await db.collection('reservations').createIndex({ bookId: 1 });
    await db.collection('reservations').createIndex({ status: 1 });
    await db.collection('reservations').createIndex({ createdAt: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};
