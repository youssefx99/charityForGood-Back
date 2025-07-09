const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/charity-db";
    console.log("🔗 Attempting to connect to MongoDB...");
    console.log("📍 URI:", mongoUri.replace(/\/\/.*@/, "//***:***@"));

    cached.promise = mongoose.connect(mongoUri, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log(`✅ MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", error.message);
    
    // In production, don't exit the process, just log the error
    if (process.env.NODE_ENV === 'production') {
      console.error("⚠️  Database connection failed in production.");
      return null;
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;
