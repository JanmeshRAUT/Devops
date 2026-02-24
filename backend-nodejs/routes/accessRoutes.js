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
 * Access precheck endpoint (GET /api/access/precheck)
 */
router.get("/precheck", async (req, res) => {
  try {
    const { patientId, userId } = req.query;
    
    if (!patientId || !userId) {
      return res.status(400).json({ error: "Missing required fields: patientId, userId" });
    }
    
    const hasAccess = await get(
      `SELECT id FROM access_requests 
       WHERE patientId = ? AND userId = ? AND status = 'approved' LIMIT 1`,
      [patientId, userId]
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

module.exports = router;

