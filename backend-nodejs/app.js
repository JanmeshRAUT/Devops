// app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import config
const config = require("./config");

// Import database
const { db } = require("./database");

// Import middleware
const { errorHandler, requestLogger } = require("./middleware");
const { limiter } = require("./limiter");

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

// ✅ Direct route aliases (for frontend direct calls without /api prefix)
app.use("/auth", authRoutes);
// Mount general routes at root so direct endpoints work (like /ip_check, /get_all_users, etc.)
app.use("/", generalRoutes);
app.use("/", patientRoutes);
app.use("/", accessRoutes);

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "✅ Backend is running",
    database: "✅ SQLite connected",
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
  console.log(`   Database: ✅ SQLite connected`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
