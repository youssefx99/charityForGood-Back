require("dotenv").config(); // Add this line at the top

// Set default environment variables for development
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "your_super_secret_jwt_key_here_change_in_production";
}
if (!process.env.JWT_EXPIRE) {
  process.env.JWT_EXPIRE = "30d";
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb://localhost:27017/charity-db";
}

// Debug environment variables
console.log("🔧 Environment Variables:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("MONGODB_URI starts with:", process.env.MONGODB_URI?.substring(0, 20) + "...");

const { connectToDB } = require("./config/db");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Initialize Express app
const app = express();

// Track DB connection status
let dbConnected = false;
connectToDB().then(() => {
  dbConnected = true;
  console.log("✅ Database connected successfully");
}).catch((error) => {
  dbConnected = false;
  console.error("❌ Database connection failed:", error.message);
  if (process.env.NODE_ENV === 'production') {
    console.error("⚠️  Continuing without database in production mode");
  } else {
    console.error("💥 Exiting in development mode due to database failure");
    process.exit(1);
  }
});

// CORS middleware should be first
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true, // Allow cookies to be sent and received
  })
);

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Vercel
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: dbConnected ? "connected" : "disconnected",
    mongoUriExists: !!process.env.MONGODB_URI
  });
});

// Database health check endpoint
app.get("/db-health", async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({
        success: false,
        message: "Database not connected",
        timestamp: new Date().toISOString()
      });
    }
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    res.status(200).json({
      success: true,
      message: "Database is healthy",
      connected: isConnected,
      readyState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// CORS test endpoint
app.get("/cors-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.use("/test", (req, res) => {
  res.json({
    message: "hellloo",
  });
});

// Database connection middleware
const requireDB = (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      success: false,
      message: "Database is not connected. Please try again later."
    });
  }
  next();
};

// Define routes with database check
app.use("/api/auth", requireDB, require("./routes/authRoutes"));
app.use("/api/members", requireDB, require("./routes/memberRoutes"));
app.use("/api/payments", requireDB, require("./routes/paymentRoutes"));
app.use("/api/expenses", requireDB, require("./routes/expenseRoutes"));
app.use("/api/vehicles", requireDB, require("./routes/vehicleRoutes"));
app.use("/api/trips", requireDB, require("./routes/tripRoutes"));
app.use("/api/maintenance", requireDB, require("./routes/maintenanceRoutes"));
app.use("/api/reports", requireDB, require("./routes/reportRoutes"));

// Default route
app.get("/", (req, res) => {
  res.send("Charity Association Management API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Only start server if not in production (Vercel handles this)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
  });
}

module.exports = app;
