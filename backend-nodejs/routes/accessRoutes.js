// routes/accessRoutes.js - SQLite Version
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware");
const { run, get, all } = require("../database");

/**
 * Request access to patient record
 */
router.post("/request", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId, accessType, reason } = req.body;
    const requesterId = req.user.email;
    
    if (!patientId || !accessType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await run(
      `INSERT INTO access_requests (patientId, requesterId, accessType, reason, status, createdAt, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientId, requesterId, accessType, reason || "", "pending", createdAt, expiresAt]
    );
    
    console.log("Access request created");
    res.json({
      success: true,
      message: "Access request submitted",
      request: {
        patientId,
        requesterId,
        accessType,
        reason,
        status: "pending",
        createdAt,
        expiresAt
      }
    });
  } catch (error) {
    console.error("Error creating access request:", error.message);
    res.status(500).json({ error: "Failed to create access request" });
  }
});

/**
 * Approve access request
 */
router.put("/:requestId/approve", verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const accessRequest = await get(
      "SELECT * FROM access_requests WHERE id = ?",
      [requestId]
    );
    
    if (!accessRequest) {
      return res.status(404).json({ error: "Access request not found" });
    }
    
    await run(
      `UPDATE access_requests SET status = ?, approvedBy = ?, approvedAt = ? WHERE id = ?`,
      ["approved", req.user.email, new Date().toISOString(), requestId]
    );
    
    console.log("Access request approved:", requestId);
    res.json({ success: true, message: "Access request approved" });
  } catch (error) {
    console.error("Error approving access request:", error.message);
    res.status(500).json({ error: "Failed to approve access request" });
  }
});

/**
 * Deny access request
 */
router.put("/:requestId/deny", verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    await run(
      `UPDATE access_requests SET status = ?, deniedBy = ?, deniedAt = ?, denialReason = ? WHERE id = ?`,
      ["denied", req.user.email, new Date().toISOString(), reason || "", requestId]
    );
    
    console.log("Access request denied:", requestId);
    res.json({ success: true, message: "Access request denied" });
  } catch (error) {
    console.error("Error denying access request:", error.message);
    res.status(500).json({ error: "Failed to deny access request" });
  }
});

/**
 * Grant emergency access
 */
router.post("/emergency", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId, reason } = req.body;
    const grantedBy = req.user.email;
    
    if (!patientId || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await run(
      `INSERT INTO emergency_access (patientId, grantedBy, reason, createdAt, expiresAt)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, grantedBy, reason, createdAt, expiresAt]
    );
    
    console.log("Emergency access granted");
    res.json({
      success: true,
      message: "Emergency access granted",
      access: {
        patientId,
        grantedBy,
        reason,
        createdAt,
        expiresAt
      }
    });
  } catch (error) {
    console.error("Error granting emergency access:", error.message);
    res.status(500).json({ error: "Failed to grant emergency access" });
  }
});

/**
 * Get access requests for patient
 */
router.get("/patient/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const requests = await all(
      "SELECT * FROM access_requests WHERE patientId = ?",
      [patientId]
    );
    
    res.json({ success: true, requests, count: requests.length });
  } catch (error) {
    console.error("Error fetching access requests:", error.message);
    res.status(500).json({ error: "Failed to fetch access requests" });
  }
});

/**
 * Doctor access request (POST /doctor_access)
 */
router.post("/doctor_access", async (req, res) => {
  try {
    const { name, patientId, reason } = req.body;
    
    if (!name || !patientId) {
      return res.status(400).json({ error: "Missing required fields: name, patientId" });
    }
    
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await run(
      `INSERT INTO access_requests (name, role, patientId, reason, status, createdAt, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, "doctor", patientId, reason || "", "pending", createdAt, expiresAt]
    );
    
    console.log("Doctor access request created");
    res.json({
      success: true,
      message: "Access request submitted"
    });
  } catch (error) {
    console.error("Error creating doctor access request:", error.message);
    res.status(500).json({ error: "Failed to create access request" });
  }
});

/**
 * Nurse access request (POST /nurse_access)
 */
router.post("/nurse_access", async (req, res) => {
  try {
    const { name, patientId, reason } = req.body;
    
    if (!name || !patientId) {
      return res.status(400).json({ error: "Missing required fields: name, patientId" });
    }
    
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await run(
      `INSERT INTO access_requests (name, role, patientId, reason, status, createdAt, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, "nurse", patientId, reason || "", "pending", createdAt, expiresAt]
    );
    
    console.log("Nurse access request created");
    res.json({
      success: true,
      message: "Access request submitted"
    });
  } catch (error) {
    console.error("Error creating nurse access request:", error.message);
    res.status(500).json({ error: "Failed to create access request" });
  }
});

/**
 * Access precheck endpoint — supports both GET (query params) and POST (body)
 * GET /api/access/precheck?patientId=X&userId=Y  → check if user has access
 * POST /api/access/precheck { justification } → evaluate justification quality (AI pre-check)
 */
router.get("/precheck", async (req, res) => {
  try {
    const { patientId, userId } = req.query;

    if (!patientId || !userId) {
      return res.status(400).json({ error: "Missing required fields: patientId, userId" });
    }

    const hasAccess = await get(
      `SELECT id FROM access_requests 
       WHERE patientId = ? AND (requesterId = ? OR userId = ?) AND status = 'approved' LIMIT 1`,
      [patientId, userId, userId]
    );

    res.json({
      success: true,
      hasAccess: !!hasAccess,
      message: hasAccess ? "Access granted" : "No active access"
    });
  } catch (error) {
    console.error("Error checking access:", error.message);
    res.status(500).json({ error: "Failed to check access" });
  }
});

/**
 * POST /precheck — Evaluate justification text for AI pre-check
 * Used by DoctorHomeTab emergency access modal
 */
router.post("/precheck", (req, res) => {
  try {
    const { justification } = req.body;

    if (!justification || !justification.trim()) {
      return res.json({ status: "invalid", message: "Justification cannot be empty" });
    }

    const text = justification.trim().toLowerCase();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Simple rule-based AI pre-check
    const medicalKeywords = [
      "emergency", "critical", "urgent", "life-threatening", "cardiac", "stroke",
      "unconscious", "bleeding", "accident", "trauma", "respiratory", "failure",
      "overdose", "allergic", "seizure", "patient", "treatment", "diagnosis"
    ];
    const weakWords = ["need", "want", "check", "look", "see", "access"];

    const hasMedicalContext = medicalKeywords.some(kw => text.includes(kw));
    const isOnlyWeak = weakWords.some(kw => text === kw) && wordCount <= 3;

    if (wordCount < 3 || isOnlyWeak) {
      return res.json({
        status: "invalid",
        message: "Too brief. Please provide a detailed clinical reason."
      });
    }

    if (hasMedicalContext && wordCount >= 5) {
      return res.json({
        status: "valid",
        message: "✅ Justification looks valid. You may proceed."
      });
    }

    return res.json({
      status: "weak",
      message: "⚠️ Justification seems weak. Include specific clinical details."
    });
  } catch (error) {
    console.error("Precheck error:", error.message);
    res.status(500).json({ error: "Failed to evaluate justification" });
  }
});

/**
 * Request temporary nurse access (POST /request_temp_access)
 * Used by NurseDashboard handleAccessRequest
 */
router.post("/request_temp_access", async (req, res) => {
  try {
    const { name, role, patient_name, patientId } = req.body;
    const requesterName = name;
    const resolvedPatient = patient_name || patientId;

    if (!requesterName || !resolvedPatient) {
      return res.status(400).json({ error: "Missing required fields: name, patient_name" });
    }

    const createdAt = new Date().toISOString();
    // Temp access expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Look up patient record
    const { get: dbGet, run: dbRun } = require("../database");
    const patient = await dbGet(
      "SELECT * FROM patients WHERE LOWER(patientName) = LOWER(?) LIMIT 1",
      [resolvedPatient]
    );

    // Log the temporary access event
    await dbRun(
      `INSERT INTO access_logs 
       (name, role, patientId, action, reason, ip, timestamp, doctor_name, doctor_role, patient_name, justification, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requesterName, role || "nurse", resolvedPatient,
        "TEMP_ACCESS", "Nurse temporary access granted",
        req.ip || "unknown", createdAt,
        requesterName, role || "nurse",
        resolvedPatient, "Temporary access requested by nurse", "Granted"
      ]
    );

    res.json({
      success: true,
      message: `✅ Temporary access granted for ${resolvedPatient}. Expires in 30 minutes.`,
      patient_data: patient || { name: resolvedPatient },
      expiresAt
    });
  } catch (error) {
    console.error("Error granting temp access:", error.message);
    res.status(500).json({ error: "Failed to grant temporary access" });
  }
});

module.exports = router;

