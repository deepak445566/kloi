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
    
    // ✅ CORRECTED SETTINGS (keepalive -> keepAlive)
    const options = {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      // ✅ Correct spelling
      keepAlive: true,
      // ✅ Correct parameter
      keepAliveInitialDelay: 300000,
      retryWrites: true,
      retryReads: true,
      family: 4,
      // ✅ Additional important settings
      autoIndex: true,
      bufferCommands: false
    };

    console.log('MongoDB Options:', options);
    
    await mongoose.connect(process.env.MONGODB_URL, options);

    isConnected = true;
    console.log('🚀 MongoDB Connected Successfully');
    
    // Monitor connections
    console.log(`📊 Connection readyState: ${mongoose.connection.readyState}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Full error:', error);
    
    // Retry logic
    if (retryCount < 3) {
      retryCount++;
      console.log(`🔄 Retrying connection (${retryCount}/3)...`);
      setTimeout(connectDB, 2000 * retryCount);
    }
  }
};

export default connectDB;