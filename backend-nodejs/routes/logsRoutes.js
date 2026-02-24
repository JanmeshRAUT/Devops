// routes/logsRoutes.js - SQLite Version
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware");
const { run, get, all } = require("../database");

/**
 * Get access logs
 */
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const logs = await all(
      "SELECT * FROM access_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?",
      [parseInt(limit), parseInt(offset)]
    );
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching logs:", error.message);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

/**
 * Get logs for specific user
 */
router.get("/user/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const logs = await all(
      "SELECT * FROM access_logs WHERE userId = ? ORDER BY timestamp DESC LIMIT ?",
      [userId, parseInt(limit)]
    );
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching user logs:", error.message);
    res.status(500).json({ error: "Failed to fetch user logs" });
  }
});

/**
 * Get logs for specific patient
 */
router.get("/patient/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50 } = req.query;
    
    const logs = await all(
      "SELECT * FROM access_logs WHERE patientId = ? ORDER BY timestamp DESC LIMIT ?",
      [patientId, parseInt(limit)]
    );
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching patient logs:", error.message);
    res.status(500).json({ error: "Failed to fetch patient logs" });
  }
});

/**
 * Log access event
 */
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId, action, patientId, details = {} } = req.body;
    
    if (!userId || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const logData = {
      userId,
      action,
      patientId: patientId || null,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      timestamp: new Date().toISOString(),
      ip: req.ip || "unknown"
    };
    
    await run(
      `INSERT INTO access_logs (userId, action, patientId, details, timestamp, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [logData.userId, logData.action, logData.patientId, logData.details, logData.timestamp, logData.ip]
    );
    
    console.log("Access log created");
    res.json({
      success: true,
      message: "Log recorded",
      log: logData
    });
  } catch (error) {
    console.error("Error creating access log:", error.message);
    res.status(500).json({ error: "Failed to create access log" });
  }
});

/**
 * Get logs for date range
 */
router.get("/date-range/:startDate/:endDate", verifyFirebaseToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    
    const logs = await all(
      `SELECT * FROM access_logs 
       WHERE timestamp >= ? AND timestamp <= ? 
       ORDER BY timestamp DESC`,
      [start.toISOString(), end.toISOString()]
    );
    
    res.json({ success: true, logs, count: logs.length });
  } catch (error) {
    console.error("Error fetching logs for date range:", error.message);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;

