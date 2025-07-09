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

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");

// Initialize Express app
const app = express();

// Global variable to track database connection status
let dbConnected = false;

// Connect to MongoDB
const initializeApp = async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error("⚠️  Continuing without database in production mode");
    } else {
      console.error("💥 Exiting in development mode due to database failure");
      process.exit(1);
    }
  }
};

// Initialize the app
initializeApp();

// CORS middleware should be first
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:3000", 
        "http://localhost:8888",
        "https://charity-for-good-front.vercel.app",
        "https://charity-for-good-front-is02n0f72-youssefs-projects-fe283e23.vercel.app",
        "https://charity-backend.vercel.app",
        "https://charity-for-good-back.vercel.app",
        "https://your-frontend-domain.netlify.app"
      ];
      
      // Allow all Vercel domains
      if (origin.includes('vercel.app')) {
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("🚫 CORS blocked origin:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow credentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

// Body parsing middleware (remove duplicates)
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
