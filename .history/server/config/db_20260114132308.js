import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  // Agar already connected hai
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB Already Connected');
    return mongoose.connection;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // ✅ REMOVE keepAlive settings COMPLETELY
    const options = {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      family: 4,
      autoIndex: true,
      bufferCommands: false
      // ❌ keepAlive settings HATA DIYE
    };

    console.log('MongoDB Options:', options);
    
    await mongoose.connect(process.env.MONGODB_URL, options);

    isConnected = true;
    console.log('🚀 MongoDB Connected Successfully');
    
    // 🔄 MANUAL KEEP-ALIVE SETUP
    setupManualKeepAlive();
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('🔄 Trying alternative connection method...');
    
    // Try with minimal options
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        maxPoolSize: 50,
        serverSelectionTimeoutMS: 30000
      });
      console.log('✅ Connected with minimal options');
      setupManualKeepAlive();
    } catch (minimalError) {
      console.error('❌ Minimal connection also failed:', minimalError.message);
    }
  }
};

// ✅ MANUAL KEEP-ALIVE FUNCTION
function setupManualKeepAlive() {
  // Har 5 minute mein ek ping bhejo
  setInterval(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.command({ ping: 1 });
        console.log('❤️  Manual keep-alive ping sent');
      }
    } catch (error) {
      console.log('⚠️  Keep-alive ping failed');
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  console.log('🔄 Manual keep-alive setup complete');
}

export default connectDB;