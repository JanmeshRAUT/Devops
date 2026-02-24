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
    status: "OK - Backend is running",
    database: "SQLite connected",
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
    console.error("IP check error:", error.message);
    res.status(500).json({ error: "Failed to get IP" });
  }
});

/**
 * Get statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const userCount = await get("SELECT COUNT(*) as count FROM users");
    const patientCount = await get("SELECT COUNT(*) as count FROM patients");
    const accessLogCount = await get("SELECT COUNT(*) as count FROM access_logs");
    const accessRequestCount = await get("SELECT COUNT(*) as count FROM access_requests");
    
    res.json({
      success: true,
      stats: {
        totalUsers: userCount.count,
        totalPatients: patientCount.count,
        totalAccessLogs: accessLogCount.count,
        totalAccessRequests: accessRequestCount.count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching statistics:", error.message);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

/**
 * Get trust score for a user
 */
router.get("/trust_score/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    const user = await get(
      "SELECT * FROM users WHERE name = ? LIMIT 1",
      [name]
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const trustScore = user.trustScore || 50;
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
    console.error("Error fetching trust score:", error.message);
    res.status(500).json({ error: "Failed to fetch trust score" });
  }
});

/**
 * Get all users
 */
router.get("/get_all_users", async (req, res) => {
  try {
    const users = await all("SELECT * FROM users");
    res.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * Get all patients
 */
router.get("/all_patients", async (req, res) => {
  try {
    const patients = await all("SELECT * FROM patients");
    res.json({ success: true, patients, count: patients.length });
  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

/**
 * Get admin access logs
 */
router.get("/access_logs/admin", async (req, res) => {
  try {
    const logs = await all(
      "SELECT * FROM access_logs ORDER BY timestamp DESC LIMIT 100"
    );
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching admin access logs:", error.message);
    res.status(500).json({ error: "Failed to fetch access logs" });
  }
});

/**
 * Get all doctor access logs
 */
router.get("/all_doctor_access_logs", async (req, res) => {
  try {
    const logs = await all(
      "SELECT * FROM access_logs WHERE role = 'doctor' ORDER BY timestamp DESC LIMIT 100"
    );
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching doctor access logs:", error.message);
    res.status(500).json({ error: "Failed to fetch doctor access logs" });
  }
});

/**
 * Get all nurse access logs
 */
router.get("/all_nurse_access_logs", async (req, res) => {
  try {
    const logs = await all(
      "SELECT * FROM access_logs WHERE role = 'nurse' ORDER BY timestamp DESC LIMIT 100"
    );
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching nurse access logs:", error.message);
    res.status(500).json({ error: "Failed to fetch nurse access logs" });
  }
});

/**
 * Get nurse access logs by name
 */
router.get("/nurse_access_logs/:name", async (req, res) => {
  try {
    const { name } = req.params;
    
    const logs = await all(
      "SELECT * FROM access_logs WHERE name = ? AND role = 'nurse' ORDER BY timestamp DESC LIMIT 50",
      [name]
    );
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching nurse access logs:", error.message);
    res.status(500).json({ error: "Failed to fetch nurse access logs" });
  }
});

/**
 * Log access event
 */
router.post("/log_access", async (req, res) => {
  try {
    const { name, role, patientId, action, reason, ip } = req.body;
    
    if (!name || !role || !patientId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const logData = {
      name,
      role,
      patientId,
      action: action || "VIEWED",
      reason: reason || "",
      ip: ip || "unknown",
      timestamp: new Date().toISOString()
    };
    
    await run(
      `INSERT INTO access_logs (name, role, patientId, action, reason, ip, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [logData.name, logData.role, logData.patientId, logData.action, logData.reason, logData.ip, logData.timestamp]
    );
    
    console.log("Access log created");
    res.json({
      success: true,
      message: "Access logged"
    });
  } catch (error) {
    console.error("Error logging access:", error.message);
    res.status(500).json({ error: "Failed to log access" });
  }
});

/**
 * Get dashboard data
 */
router.get("/dashboard", async (req, res) => {
  try {
    // Get recent access logs
    const logs = await all(
      "SELECT * FROM access_logs ORDER BY timestamp DESC LIMIT 10"
    );
    
    // Get pending access requests
    const requests = await all(
      "SELECT * FROM access_requests WHERE status = 'pending'"
    );
    
    res.json({
      success: true,
      dashboard: {
        recentLogs: logs,
        pendingRequests: requests,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
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
    console.error("Error fetching system info:", error.message);
    res.status(500).json({ error: "Failed to fetch system info" });
  }
});

module.exports = router;

