import mongoose from 'mongoose';

let isConnected = false;
let retryCount = 0;

const connectDB = async () => {
  // Agar already connected hai
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB Already Connected');
    return mongoose.connection;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URL, {
      // 🚀 Vercel/Render ke liye MUST-HAVE settings
      maxPoolSize: 50,                     // Zyada connections allow karo
      minPoolSize: 10,                     // Minimum 10 connections ready rakho
      serverSelectionTimeoutMS: 30000,     // 30 seconds wait
      socketTimeoutMS: 45000,              // 45 seconds timeout
      connectTimeoutMS: 30000,             // 30 seconds connection timeout
      keepAlive: true,                     // Connection alive rakho
      keepAliveInitialDelay: 300000,       // 5 minutes
      retryWrites: true,
      retryReads: true,
      family: 4                            // IPv4 use karo (faster)
    });

    isConnected = true;
    console.log('🚀 MongoDB Connected Successfully');
    
    // Event listeners for monitoring
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Connected');
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('❌ MongoDB Disconnected');
      isConnected = false;
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Error:', err.message);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    // Retry logic
    if (retryCount < 3) {
      retryCount++;
      console.log(`🔄 Retrying connection (${retryCount}/3)...`);
      setTimeout(connectDB, 2000 * retryCount);
    }
  }
};

// Export the function
export default connectDB;