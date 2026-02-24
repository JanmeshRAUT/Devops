// routes/generalRoutes.js - SQLite Version
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware");
const { run, get, all } = require("../database");
const db = require("../database");
const { calculateTrustScore, getTrustLevel, recalculateTrustScore } = require("../trustLogic");

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
 * IP Check endpoint - returns IP and inside_network flag
 */
router.get("/ip_check", (req, res) => {
  try {
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.ip ||
      req.connection?.remoteAddress ||
      "unknown";

    // Consider "inside network" if IP is local/private range
    const isPrivate =
      clientIp === "::1" ||
      clientIp === "127.0.0.1" ||
      clientIp.startsWith("192.168.") ||
      clientIp.startsWith("10.") ||
      clientIp.startsWith("172.") ||
      clientIp === "unknown";

    res.json({
      success: true,
      ip: clientIp,
      inside_network: isPrivate,
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
 * Get trust score for a user - returns BOTH trust_score (snake_case) and trustScore (camelCase)
 */
router.get("/trust_score/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const user = await get(
      "SELECT * FROM users WHERE name = ? LIMIT 1",
      [name]
    );

    if (!user) {
      // Return default score if user not found (new user scenario)
      return res.json({
        success: true,
        trust_score: 50,
        trustScore: 50,
        trustLevel: "Medium",
        user: { name, role: "unknown", email: "" }
      });
    }

    const trustScore = user.trustScore || 50;
    const trustLevel = getTrustLevel(trustScore);

    res.json({
      success: true,
      trust_score: trustScore,   // snake_case for frontend compatibility
      trustScore: trustScore,    // camelCase for future compatibility
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
      "SELECT * FROM access_logs WHERE (name = ? OR doctor_name = ?) AND role = 'nurse' ORDER BY timestamp DESC LIMIT 50",
      [name, name]
    );

    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching nurse access logs:", error.message);
    res.status(500).json({ error: "Failed to fetch nurse access logs" });
  }
});

/**
 * Get doctor access logs by name — NEW (was missing)
 */
router.get("/doctor_access_logs/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const logs = await all(
      `SELECT * FROM access_logs 
       WHERE (name = ? OR doctor_name = ?) AND role = 'doctor' 
       ORDER BY timestamp DESC LIMIT 100`,
      [name, name]
    );

    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching doctor access logs:", error.message);
    res.status(500).json({ error: "Failed to fetch doctor access logs" });
  }
});

/**
 * Get patient access history by patient name — NEW (was missing)
 * Used by PatientDashboard to show which doctors accessed their records
 */
router.get("/patient_access_history/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const logs = await all(
      `SELECT * FROM access_logs 
       WHERE patient_name = ? OR patientId = ?
       ORDER BY timestamp DESC LIMIT 100`,
      [name, name]
    );

    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching patient access history:", error.message);
    res.status(500).json({ error: "Failed to fetch patient access history" });
  }
});

/**
 * Log access event — updated to store all frontend fields
 */
router.post("/log_access", async (req, res) => {
  try {
    const {
      name,
      role,
      patientId,
      action,
      reason,
      ip,
      // Extended fields from DoctorDashboard / NurseDashboard
      doctor_name,
      doctor_role,
      patient_name,
      justification,
      status
    } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: "Missing required fields: name, role" });
    }

    const logData = {
      name,
      role,
      patientId: patientId || patient_name || null,
      action: action || "VIEWED",
      reason: reason || justification || "",
      ip: ip || req.ip || "unknown",
      timestamp: new Date().toISOString(),
      doctor_name: doctor_name || name,
      doctor_role: doctor_role || role,
      patient_name: patient_name || patientId || "",
      justification: justification || reason || "",
      status: status || "Success"
    };

    await run(
      `INSERT INTO access_logs 
       (name, role, patientId, action, reason, ip, timestamp, doctor_name, doctor_role, patient_name, justification, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logData.name,
        logData.role,
        logData.patientId,
        logData.action,
        logData.reason,
        logData.ip,
        logData.timestamp,
        logData.doctor_name,
        logData.doctor_role,
        logData.patient_name,
        logData.justification,
        logData.status
      ]
    );

    console.log("Access log created");

    // 🔄 Recalculate trust score after any logged event
    const actorName = logData.doctor_name || logData.name;
    if (actorName && actorName !== "N/A") {
      recalculateTrustScore(actorName, db)
        .catch(e => console.warn("Trust recalc error:", e.message));
    }

    res.json({ success: true, message: "Access logged" });
  } catch (error) {
    console.error("Error logging access:", error.message);
    res.status(500).json({ error: "Failed to log access" });
  }
});

/**
 * Update log status — NEW (used by FlaggedEvents to mark Resolved/Dismissed)
 */
router.post("/update_log_status", async (req, res) => {
  try {
    const { log_id, status } = req.body;

    if (!log_id || !status) {
      return res.status(400).json({ error: "Missing required fields: log_id, status" });
    }

    await run(
      "UPDATE access_logs SET status = ? WHERE id = ?",
      [status, log_id]
    );

    console.log(`Log ${log_id} status updated to: ${status}`);
    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error("Error updating log status:", error.message);
    res.status(500).json({ error: "Failed to update log status" });
  }
});

/**
 * Get dashboard data
 */
router.get("/dashboard", async (req, res) => {
  try {
    const logs = await all(
      "SELECT * FROM access_logs ORDER BY timestamp DESC LIMIT 10"
    );
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
