// routes/generalRoutes.js - SQLite Version
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware");
const { run, get, all } = require("../database");
const { calculateTrustScore, getTrustLevel } = require("../trustLogic");

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    status: "âœ… Backend is running",
    database: "✅ SQLite connected",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

/**
 * IP Check endpoint
 */
router.get("/ip_check", (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress || "unknown";
    res.json({
      success: true,
      ip: clientIp,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("âŒ IP check error:", error.message);
    res.status(500).json({ error: "âŒ Failed to get IP" });
  }
});

/**
 * Get statistics
 */
router.get("/stats", async (req, res) => {
  try {
    
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
    console.error("âŒ Error fetching statistics:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch statistics" });
  }
});

/**
 * Get trust score for a user
 */
router.get("/trust_score/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    
    // Query user by name
    const userSnapshot = await db.collection("users")
      .where("name", "==", name)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      return res.status(404).json({ error: "âŒ User not found" });
    }
    
    const user = userSnapshot.docs[0].data();
    const trustScore = user.trustScore || 50; // Default trust score
    const trustLevel = getTrustLevel(trustScore);
    
    res.json({
      success: true,
      trustScore,
      trustLevel,
      user: {
        name: user.name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error("âŒ Error fetching trust score:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch trust score" });
  }
});

/**
 * Get all users
 */
router.get("/get_all_users", async (req, res) => {
  try {
    
    const snapshot = await db.collection("users").get();
    const users = [];
    
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error("âŒ Error fetching users:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch users" });
  }
});

/**
 * Get all patients
 */
router.get("/all_patients", async (req, res) => {
  try {
    
    const snapshot = await db.collection("patients").get();
    const patients = [];
    
    snapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, patients, count: patients.length });
  } catch (error) {
    console.error("âŒ Error fetching patients:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch patients" });
  }
});

/**
 * Get admin access logs
 */
router.get("/access_logs/admin", async (req, res) => {
  try {
    
    const snapshot = await db.collection("access_logs")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("âŒ Error fetching admin access logs:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch access logs" });
  }
});

/**
 * Get all doctor access logs
 */
router.get("/all_doctor_access_logs", async (req, res) => {
  try {
    
    const snapshot = await db.collection("access_logs")
      .where("role", "==", "doctor")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("âŒ Error fetching doctor access logs:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch doctor access logs" });
  }
});

/**
 * Get all nurse access logs
 */
router.get("/all_nurse_access_logs", async (req, res) => {
  try {
    
    const snapshot = await db.collection("access_logs")
      .where("role", "==", "nurse")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("âŒ Error fetching nurse access logs:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch nurse access logs" });
  }
});

/**
 * Get nurse access logs by name
 */
router.get("/nurse_access_logs/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    
    const snapshot = await db.collection("access_logs")
      .where("name", "==", name)
      .where("role", "==", "nurse")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("âŒ Error fetching nurse access logs:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch nurse access logs" });
  }
});

/**
 * Log access event
 */
router.post("/log_access", async (req, res) => {
  try {
    const { name, role, patientId, action, reason, ip } = req.body;
    
    if (!name || !role || !patientId) {
      return res.status(400).json({ error: "âŒ Missing required fields" });
    }
    
    
    const logRef = db.collection("access_logs").doc();
    const logData = {
      name,
      role,
      patientId,
      action: action || "VIEWED",
      reason: reason || "",
      ip: ip || "unknown",
      timestamp: new Date()
    };
    
    await logRef.set(logData);
    
    console.log(`âœ… Access log created: ${logRef.id}`);
    res.json({
      success: true,
      message: "âœ… Access logged",
      logId: logRef.id
    });
  } catch (error) {
    console.error("âŒ Error logging access:", error.message);
    res.status(500).json({ error: "âŒ Failed to log access" });
  }
});

/**
 * Get dashboard data
 */
router.get("/dashboard", async (req, res) => {
  try {
    
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
    console.error("âŒ Error fetching dashboard data:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch dashboard data" });
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
    console.error("âŒ Error fetching system info:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch system info" });
  }
});

module.exports = router;

