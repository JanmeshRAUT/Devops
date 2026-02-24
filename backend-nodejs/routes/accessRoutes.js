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
      return res.status(400).json({ error: "âŒ Missing required fields" });
    }
    
    
    const accessRef = db.collection("access_requests").doc();
    const accessData = {
      patientId,
      requesterId,
      accessType,
      reason: reason || "",
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    await accessRef.set(accessData);
    
    console.log(`âœ… Access request created: ${accessRef.id}`);
    res.json({
      success: true,
      message: "âœ… Access request submitted",
      requestId: accessRef.id,
      request: accessData
    });
  } catch (error) {
    console.error("âŒ Error creating access request:", error.message);
    res.status(500).json({ error: "âŒ Failed to create access request" });
  }
});

/**
 * Approve access request
 */
router.put("/:requestId/approve", verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    
    const accessDoc = await db.collection("access_requests").doc(requestId).get();
    
    if (!accessDoc.exists) {
      return res.status(404).json({ error: "âŒ Access request not found" });
    }
    
    await db.collection("access_requests").doc(requestId).update({
      status: "approved",
      approvedBy: req.user.email,
      approvedAt: new Date()
    });
    
    console.log(`âœ… Access request approved: ${requestId}`);
    res.json({ success: true, message: "âœ… Access request approved" });
  } catch (error) {
    console.error("âŒ Error approving access request:", error.message);
    res.status(500).json({ error: "âŒ Failed to approve access request" });
  }
});

/**
 * Deny access request
 */
router.put("/:requestId/deny", verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    
    await db.collection("access_requests").doc(requestId).update({
      status: "denied",
      deniedBy: req.user.email,
      deniedAt: new Date(),
      denialReason: reason || ""
    });
    
    console.log(`âœ… Access request denied: ${requestId}`);
    res.json({ success: true, message: "âœ… Access request denied" });
  } catch (error) {
    console.error("âŒ Error denying access request:", error.message);
    res.status(500).json({ error: "âŒ Failed to deny access request" });
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
      return res.status(400).json({ error: "âŒ Missing required fields" });
    }
    
    
    const emergencyRef = db.collection("emergency_access").doc();
    const emergencyData = {
      patientId,
      grantedBy,
      reason,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
    await emergencyRef.set(emergencyData);
    
    console.log(`âœ… Emergency access granted: ${emergencyRef.id}`);
    res.json({
      success: true,
      message: "âœ… Emergency access granted",
      accessId: emergencyRef.id,
      access: emergencyData
    });
  } catch (error) {
    console.error("âŒ Error granting emergency access:", error.message);
    res.status(500).json({ error: "âŒ Failed to grant emergency access" });
  }
});

/**
 * Get access requests for patient
 */
router.get("/patient/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    
    const snapshot = await db.collection("access_requests")
      .where("patientId", "==", patientId)
      .get();
    
    const requests = [];
    snapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, requests, count: requests.length });
  } catch (error) {
    console.error("âŒ Error fetching access requests:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch access requests" });
  }
});

/**
 * Doctor access request (POST /doctor_access)
 */
router.post("/doctor_access", async (req, res) => {
  try {
    const { name, patientId, reason } = req.body;
    
    if (!name || !patientId) {
      return res.status(400).json({ error: "âŒ Missing required fields: name, patientId" });
    }
    
    
    const accessRef = db.collection("access_requests").doc();
    const accessData = {
      name,
      role: "doctor",
      patientId,
      reason: reason || "",
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    await accessRef.set(accessData);
    
    console.log(`âœ… Doctor access request created: ${accessRef.id}`);
    res.json({
      success: true,
      message: "âœ… Access request submitted",
      requestId: accessRef.id
    });
  } catch (error) {
    console.error("âŒ Error creating doctor access request:", error.message);
    res.status(500).json({ error: "âŒ Failed to create access request" });
  }
});

/**
 * Nurse access request (POST /nurse_access)
 */
router.post("/nurse_access", async (req, res) => {
  try {
    const { name, patientId, reason } = req.body;
    
    if (!name || !patientId) {
      return res.status(400).json({ error: "âŒ Missing required fields: name, patientId" });
    }
    
    
    const accessRef = db.collection("access_requests").doc();
    const accessData = {
      name,
      role: "nurse",
      patientId,
      reason: reason || "",
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    await accessRef.set(accessData);
    
    console.log(`âœ… Nurse access request created: ${accessRef.id}`);
    res.json({
      success: true,
      message: "âœ… Access request submitted",
      requestId: accessRef.id
    });
  } catch (error) {
    console.error("âŒ Error creating nurse access request:", error.message);
    res.status(500).json({ error: "âŒ Failed to create access request" });
  }
});

/**
 * Access precheck endpoint (GET /api/access/precheck)
 */
router.get("/precheck", async (req, res) => {
  try {
    const { patientId, userId } = req.query;
    
    if (!patientId || !userId) {
      return res.status(400).json({ error: "âŒ Missing required fields: patientId, userId" });
    }
    
    
    // Check if user has active access
    const snapshot = await db.collection("access_requests")
      .where("patientId", "==", patientId)
      .where("userId", "==", userId)
      .where("status", "==", "approved")
      .get();
    
    const hasAccess = !snapshot.empty;
    
    res.json({
      success: true,
      hasAccess,
      message: hasAccess ? "âœ… Access granted" : "âŒ No active access"
    });
  } catch (error) {
    console.error("âŒ Error checking access:", error.message);
    res.status(500).json({ error: "âŒ Failed to check access" });
  }
});

module.exports = router;

