// routes/generalRoutes.js
const express = require("express");
const router = express.Router();
const { db, firebaseInitialized } = require("../firebase");

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    status: "✅ Backend is running",
    firebase: firebaseInitialized ? "✅ Connected" : "❌ Not connected",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

/**
 * Get statistics
 */
router.get("/stats", async (req, res) => {
  try {
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const usersSnapshot = await db.collection("users").get();
    const patientsSnapshot = await db.collection("patients").get();
    const accessLogsSnapshot = await db.collection("access_logs").get();
    const accessRequestsSnapshot = await db.collection("access_requests").get();
    
    res.json({
      success: true,
      stats: {
        totalUsers: usersSnapshot.size,
        totalPatients: patientsSnapshot.size,
        totalAccessLogs: accessLogsSnapshot.size,
        totalAccessRequests: accessRequestsSnapshot.size,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("❌ Error fetching statistics:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch statistics" });
  }
});

/**
 * Get dashboard data
 */
router.get("/dashboard", async (req, res) => {
  try {
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    // Get recent access logs
    const recentLogs = await db.collection("access_logs")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();
    
    const logs = [];
    recentLogs.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get pending access requests
    const pendingRequests = await db.collection("access_requests")
      .where("status", "==", "pending")
      .get();
    
    const requests = [];
    pendingRequests.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      dashboard: {
        recentLogs: logs,
        pendingRequests: requests,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch dashboard data" });
  }
});

/**
 * Get system information
 */
router.get("/system-info", (req, res) => {
  try {
    const os = require("os");
    
    res.json({
      success: true,
      system: {
        nodejs: process.version,
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB"
        },
        platform: os.platform(),
        arch: os.arch(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("❌ Error fetching system info:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch system info" });
  }
});

module.exports = router;
