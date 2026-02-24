// routes/accessRoutes.js - SQLite Version
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware");
const { run, get, all } = require("../database");
const config = require("../config");
const { recalculateTrustScore } = require("../trustLogic");
const db = require("../database");
const {
  sendAccessApprovedEmail,
  sendAccessDeniedEmail,
  sendEmergencyAccessAlert,
  sendNewAccessRequestNotification
} = require("../utils");

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

    // 📧 Notify admin about new access request
    sendNewAccessRequestNotification(
      config.ADMIN_EMAIL,
      req.user?.name || requesterId,
      requesterId,
      patientId,
      reason
    ).catch(err => console.error("Email notification error:", err.message));

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

    // 📧 Notify requester of approval
    if (accessRequest.requesterId) {
      sendAccessApprovedEmail(
        accessRequest.requesterId,
        accessRequest.name || accessRequest.requesterId,
        accessRequest.patientId,
        accessRequest.accessType,
        req.user.email
      ).catch(err => console.error("Email notification error:", err.message));
    }

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
    
    // Get request details before updating (to send email)
    const denyRequest = await get(
      "SELECT * FROM access_requests WHERE id = ?",
      [requestId]
    );

    await run(
      `UPDATE access_requests SET status = ?, deniedBy = ?, deniedAt = ?, denialReason = ? WHERE id = ?`,
      ["denied", req.user.email, new Date().toISOString(), reason || "", requestId]
    );

    // 📧 Notify requester of denial
    if (denyRequest && denyRequest.requesterId) {
      sendAccessDeniedEmail(
        denyRequest.requesterId,
        denyRequest.name || denyRequest.requesterId,
        denyRequest.patientId,
        reason,
        req.user.email
      ).catch(err => console.error("Email notification error:", err.message));
    }

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

    // 📧 Alert admin about emergency access
    sendEmergencyAccessAlert(
      config.ADMIN_EMAIL,
      grantedBy,
      patientId,
      reason
    ).catch(err => console.error("Emergency email error:", err.message));

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

/**
 * Normal Access (POST /normal_access)
 * Grants immediate access for in-network doctors (routine care)
 */
router.post("/normal_access", async (req, res) => {
  try {
    const { name, role, patient_name } = req.body;
    
    if (!name || !patient_name) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: name, patient_name" 
      });
    }

    // Find patient - get ALL fields
    const patient = await get(
      "SELECT * FROM patients WHERE LOWER(patientName) = LOWER(?) LIMIT 1",
      [patient_name]
    );

    if (!patient) {
      return res.status(404).json({ 
        success: false,
        error: `Patient "${patient_name}" not found in the system.` 
      });
    }

    // Log the normal access
    const createdAt = new Date().toISOString();
    try {
      await run(
        `INSERT INTO access_logs 
         (name, role, patientId, action, reason, timestamp, doctor_name, doctor_role, patient_name, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, role || "doctor", patient.id,
          "NORMAL_ACCESS", "Routine care access granted",
          createdAt,
          name, role || "doctor",
          patient_name, "Success"
        ]
      );
    } catch (logErr) {
      console.warn("Access log warning (non-fatal):", logErr.message);
    }

    // Transform patient data to match frontend expectations
    const transformedPatient = {
      ...patient,
      name: patient.patientName,
      email: patient.patient_email,
      // Ensure all expected fields exist
      age: patient.age || "—",
      gender: patient.gender || "—",
      diagnosis: patient.diagnosis || "Pending Evaluation",
      treatment: patient.treatment || "No treatment plan recorded.",
      notes: patient.notes || "No clinical notes available."
    };

    console.log("✅ Normal access granted:", { doctor: name, patient: patient_name });

    // 🔄 Recalculate trust score asynchronously
    recalculateTrustScore(name, db).catch(e => console.warn("Trust recalc error:", e.message));

    res.json({
      success: true,
      message: `✅ Normal access granted for ${patient_name}.`,
      patient_data: transformedPatient
    });
  } catch (error) {
    console.error("Error in /normal_access:", error.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to grant normal access: " + error.message 
    });
  }
});

/**
 * Restricted Access (POST /restricted_access)
 * Creates a PENDING access request that requires admin approval
 */
router.post("/restricted_access", async (req, res) => {
  try {
    const { name, role, patient_name, justification } = req.body;
    
    if (!name || !patient_name || !justification) {
      return res.status(400).json({ error: "Missing required fields: name, patient_name, justification" });
    }

    // Find patient
    const patient = await get(
      "SELECT id FROM patients WHERE LOWER(patientName) = LOWER(?) LIMIT 1",
      [patient_name]
    );

    if (!patient) {
      return res.status(404).json({ error: `Patient "${patient_name}" not found` });
    }

    // Create PENDING access request (requires admin approval)
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await run(
      `INSERT INTO access_requests (name, role, patientId, reason, status, createdAt, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, role || "doctor", patient.id, justification, "pending", createdAt, expiresAt]
    );

    // Log the access request creation
    await run(
      `INSERT INTO access_logs 
       (name, role, patientId, action, reason, timestamp, doctor_name, doctor_role, patient_name, justification, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, role || "doctor", patient.id,
        "RESTRICTED_ACCESS_REQUEST", "Unrestricted access requested",
        createdAt,
        name, role || "doctor",
        patient_name, justification, "Pending Admin Approval"
      ]
    );

    // Send notification to admin
    sendNewAccessRequestNotification(
      config.ADMIN_EMAIL,
      name,
      "", // email not provided
      patient.id,
      justification
    ).catch(err => console.error("Admin notification error:", err.message));

    console.log(`Restricted access request created for ${name} on patient ${patient_name}`);

    // 🔄 Recalculate trust score asynchronously (-8 for restricted request)
    recalculateTrustScore(name, db).catch(e => console.warn("Trust recalc error:", e.message));

    res.json({
      success: true,
      message: `📋 Access request submitted. Awaiting admin approval...`,
      patient_data: null  // Do NOT return patient data yet
    });
  } catch (error) {
    console.error("Error creating restricted access request:", error.message);
    res.status(500).json({ error: "Failed to create access request" });
  }
});

/**
 * Emergency Access (POST /emergency_access)
 * Grants IMMEDIATE break-glass access with mandatory admin alert
 */
router.post("/emergency_access", async (req, res) => {
  try {
    const { name, role, patient_name, justification } = req.body;
    
    if (!name || !patient_name || !justification) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: name, patient_name, justification" 
      });
    }

    // Find patient
    const patient = await get(
      "SELECT * FROM patients WHERE LOWER(patientName) = LOWER(?) LIMIT 1",
      [patient_name]
    );

    if (!patient) {
      return res.status(404).json({ 
        success: false,
        error: `Patient "${patient_name}" not found in the system.` 
      });
    }

    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Create emergency access entry
    try {
      await run(
        `INSERT INTO emergency_access (patientId, grantedBy, reason, createdAt, expiresAt)
         VALUES (?, ?, ?, ?, ?)`,
        [patient.id, name, justification, createdAt, expiresAt]
      );
    } catch (emErr) {
      console.warn("Emergency record creation warning:", emErr.message);
    }

    // Log the emergency (break-glass) access
    try {
      await run(
        `INSERT INTO access_logs 
         (name, role, patientId, action, reason, timestamp, doctor_name, doctor_role, patient_name, justification, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, role || "doctor", patient.id,
          "EMERGENCY_ACCESS", "Break-glass emergency access granted",
          createdAt,
          name, role || "doctor",
          patient_name, justification, "Emergency"
        ]
      );
    } catch (logErr) {
      console.warn("Emergency log warning (non-fatal):", logErr.message);
    }

    // Alert admin immediately
    sendEmergencyAccessAlert(
      config.ADMIN_EMAIL,
      name,
      patient.id,
      justification
    ).catch(err => console.error("Emergency alert error:", err.message));

    // Transform patient data to match frontend expectations
    const transformedPatient = {
      ...patient,
      name: patient.patientName,
      email: patient.patient_email,
      // Ensure all expected fields exist
      age: patient.age || "—",
      gender: patient.gender || "—",
      diagnosis: patient.diagnosis || "Pending Evaluation",
      treatment: patient.treatment || "No treatment plan recorded.",
      notes: patient.notes || "No clinical notes available."
    };

    console.log("🚨 Emergency access granted:", { doctor: name, patient: patient_name });

    // 🔄 Recalculate trust score asynchronously (-5 emergency, -15 if outside network)
    recalculateTrustScore(name, db).catch(e => console.warn("Trust recalc error:", e.message));

    res.json({
      success: true,
      message: `🚨 Emergency access granted for ${patient_name}. Admin has been alerted.`,
      patient_data: transformedPatient
    });
  } catch (error) {
    console.error("Error in /emergency_access:", error.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to grant emergency access: " + error.message 
    });
  }
});

module.exports = router;

