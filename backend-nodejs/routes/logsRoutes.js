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
    
    
    const snapshot = await db.collection("access_logs")
      .orderBy("timestamp", "desc")
      .limit(parseInt(limit))
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
    console.error("âŒ Error fetching logs:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch logs" });
  }
});

/**
 * Get logs for specific user
 */
router.get("/user/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    
    const snapshot = await db.collection("access_logs")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(parseInt(limit))
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
    console.error("âŒ Error fetching user logs:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch user logs" });
  }
});

/**
 * Get logs for specific patient
 */
router.get("/patient/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50 } = req.query;
    
    
    const snapshot = await db.collection("access_logs")
      .where("patientId", "==", patientId)
      .orderBy("timestamp", "desc")
      .limit(parseInt(limit))
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
    console.error("âŒ Error fetching patient logs:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch patient logs" });
  }
});

/**
 * Log access event
 */
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId, action, patientId, details = {} } = req.body;
    
    if (!userId || !action) {
      return res.status(400).json({ error: "âŒ Missing required fields" });
    }
    
    
    const logRef = db.collection("access_logs").doc();
    const logData = {
      userId,
      action,
      patientId: patientId || null,
      details,
      timestamp: new Date(),
      ip: req.ip || "unknown"
    };
    
    await logRef.set(logData);
    
    console.log(`âœ… Access log created: ${logRef.id}`);
    res.json({
      success: true,
      message: "âœ… Log recorded",
      logId: logRef.id,
      log: logData
    });
  } catch (error) {
    console.error("âŒ Error creating access log:", error.message);
    res.status(500).json({ error: "âŒ Failed to create access log" });
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
      return res.status(400).json({ error: "âŒ Invalid date format" });
    }
    
    
    const snapshot = await db.collection("access_logs")
      .where("timestamp", ">=", start)
      .where("timestamp", "<=", end)
      .orderBy("timestamp", "desc")
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
    console.error("âŒ Error fetching logs for date range:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch logs" });
  }
});

module.exports = router;

