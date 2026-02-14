// app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import config
const config = require("./config");

// Import middleware
const { errorHandler, requestLogger } = require("./middleware");
const { limiter } = require("./limiter");

// Import firebase
const { firebaseInitialized } = require("./firebase");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const accessRoutes = require("./routes/accessRoutes");
const logsRoutes = require("./routes/logsRoutes");
const generalRoutes = require("./routes/generalRoutes");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    /https:\/\/.*\.vercel\.app$/,
    "https://pbl6-40m0.onrender.com",
    "*"
  ],
  credentials: true
}));

// ✅ Request logging
app.use(requestLogger);

// ✅ Rate limiting
app.use(limiter);

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/general", generalRoutes);

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "✅ Backend is running",
    firebase: firebaseInitialized ? "✅ Connected" : "❌ Not connected",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "❌ Endpoint not found",
    path: req.path
  });
});

// ✅ Global error handler (must be last)
app.use(errorHandler);

// ✅ Start server
const PORT = config.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Express.js server running on port ${PORT}`);
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   Firebase: ${firebaseInitialized ? "✅ Connected" : "❌ Not connected"}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
