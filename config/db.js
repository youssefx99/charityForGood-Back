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
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.promise = mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/charity-db",
      opts
    );
  }

  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection error:", error.message);
    
    // In production, don't exit the process, just log the error
    if (process.env.NODE_ENV === 'production') {
      console.error("Database connection failed in production. Please check your MONGODB_URI environment variable.");
      // Return null instead of throwing to prevent crashes
      return null;
    } else {
      // In development, throw the error
      throw error;
    }
  }

  return cached.conn;
};

module.exports = connectDB;
