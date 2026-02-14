// routes/logsRoutes.js
const express = require("express");
const router = express.Router();
const { db, firebaseInitialized } = require("../firebase");
const { verifyFirebaseToken } = require("../middleware");

/**
 * Get access logs
 */
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
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
    console.error("❌ Error fetching logs:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch logs" });
  }
});

/**
 * Get logs for specific user
 */
router.get("/user/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
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
    console.error("❌ Error fetching user logs:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch user logs" });
  }
});

/**
 * Get logs for specific patient
 */
router.get("/patient/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50 } = req.query;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
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
    console.error("❌ Error fetching patient logs:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch patient logs" });
  }
});

/**
 * Log access event
 */
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId, action, patientId, details = {} } = req.body;
    
    if (!userId || !action) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
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
    
    console.log(`✅ Access log created: ${logRef.id}`);
    res.json({
      success: true,
      message: "✅ Log recorded",
      logId: logRef.id,
      log: logData
    });
  } catch (error) {
    console.error("❌ Error creating access log:", error.message);
    res.status(500).json({ error: "❌ Failed to create access log" });
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
      return res.status(400).json({ error: "❌ Invalid date format" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
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
    console.error("❌ Error fetching logs for date range:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch logs" });
  }
});

module.exports = router;
