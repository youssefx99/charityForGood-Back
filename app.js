require("dotenv").config(); // Add this line at the top

// Set default environment variables for development
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "your_super_secret_jwt_key_here_change_in_production";
}
if (!process.env.JWT_EXPIRE) {
  process.env.JWT_EXPIRE = "30d";
}
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb://localhost:27017/charity-db";
}

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// CORS middleware should be first
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:8888",
      "https://charity-for-good-front.vercel.app",
      "https://charity-for-good-front-is02n0f72-youssefs-projects-fe283e23.vercel.app", // Full Vercel URL
      "https://your-frontend-domain.netlify.app"  // Add your frontend Netlify URL if using Netlify
    ],
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
    environment: process.env.NODE_ENV || "development"
  });
});

app.use("/test", (req, res) => {
  res.json({
    message: "hellloo",
  });
});

// Define routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/pdf", require("./routes/pdfRoutes"));

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
    console.log(`MongoDB URI: ${process.env.MONGO_URI}`);
  });
}

module.exports = app;
