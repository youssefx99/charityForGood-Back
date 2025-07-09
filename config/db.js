const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async (retries = 3) => {  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 1, // Reduced for serverless
      minPoolSize: 0, // Allow no connections when idle
      serverSelectionTimeoutMS: 15000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000, // Reduced connect timeout
      family: 4,
      keepAlive: true,
      keepAliveInitialDelay: 300000, // 5 minutes
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/charity-db";
    console.log("🔗 Attempting to connect to MongoDB...");
    console.log("📍 URI:", mongoUri.replace(/\/\/.*@/, "//***:***@")); // Hide credentials in logs

    cached.promise = mongoose.connect(mongoUri, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log(`✅ MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", error.message);
    
    // Retry logic for production
    if (process.env.NODE_ENV === 'production' && retries > 0) {
      console.log(`🔄 Retrying connection... (${retries} attempts left)`);
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectDB(retries - 1);
    }
    
    // In production, don't exit the process, just log the error
    if (process.env.NODE_ENV === 'production') {
      console.error("⚠️  Database connection failed in production. Please check your MONGODB_URI environment variable.");
      console.error("🔧 Make sure your MongoDB Atlas network access allows connections from Vercel's IPs");
      console.error("🔧 Try increasing the connection timeout or check your MongoDB Atlas cluster status");
      // Return null instead of throwing to prevent crashes
      return null;
    } else {
      // In development, throw the error
      throw error;
    }
  }
};

module.exports = connectDB;
