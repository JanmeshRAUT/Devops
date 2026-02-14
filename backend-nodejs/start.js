#!/usr/bin/env node

/**
 * EHR Backend - Entry Point
 * Start the Node.js Express server
 * 
 * Usage: node start.js
 * Or: npm run dev
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = require('./config');
const { errorHandler, requestLogger } = require('./middleware');
const { limiter } = require('./limiter');
const { firebaseInitialized } = require('./firebase');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const accessRoutes = require('./routes/accessRoutes');
const logsRoutes = require('./routes/logsRoutes');
const generalRoutes = require('./routes/generalRoutes');

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

const PORT = config.PORT;

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log('🚀 EHR Backend Server Started');
  console.log(`${'='.repeat(50)}`);
  console.log(`\n✅ Port: ${PORT}`);
  console.log(`✅ Environment: ${config.NODE_ENV}`);
  console.log(`✅ Firebase: ${firebaseInitialized ? '✅ Connected' : '❌ Not connected'}`);
  console.log(`✅ URL: http://localhost:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/health`);
  console.log(`\n📝 API Routes:`);
  console.log(`   - POST   /api/auth/user_login`);
  console.log(`   - POST   /api/auth/verify_otp`);
  console.log(`   - GET    /api/users/profile`);
  console.log(`   - GET    /api/patients`);
  console.log(`   - POST   /api/access/request`);
  console.log(`   - GET    /api/logs`);
  console.log(`\n${'-'.repeat(50)}\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
