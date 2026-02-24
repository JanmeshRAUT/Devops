// routes/accessRoutes.js
const express = require("express");
const router = express.Router();
const { db, firebaseInitialized } = require("../firebase");
const { verifyFirebaseToken } = require("../middleware");

/**
 * Request access to patient record
 */
router.post("/request", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId, accessType, reason } = req.body;
    const requesterId = req.user.email;
    
    if (!patientId || !accessType) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
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
    
    console.log(`✅ Access request created: ${accessRef.id}`);
    res.json({
      success: true,
      message: "✅ Access request submitted",
      requestId: accessRef.id,
      request: accessData
    });
  } catch (error) {
    console.error("❌ Error creating access request:", error.message);
    res.status(500).json({ error: "❌ Failed to create access request" });
  }
});

/**
 * Approve access request
 */
router.put("/:requestId/approve", verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const accessDoc = await db.collection("access_requests").doc(requestId).get();
    
    if (!accessDoc.exists) {
      return res.status(404).json({ error: "❌ Access request not found" });
    }
    
    await db.collection("access_requests").doc(requestId).update({
      status: "approved",
      approvedBy: req.user.email,
      approvedAt: new Date()
    });
    
    console.log(`✅ Access request approved: ${requestId}`);
    res.json({ success: true, message: "✅ Access request approved" });
  } catch (error) {
    console.error("❌ Error approving access request:", error.message);
    res.status(500).json({ error: "❌ Failed to approve access request" });
  }
});

/**
 * Deny access request
 */
router.put("/:requestId/deny", verifyFirebaseToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    await db.collection("access_requests").doc(requestId).update({
      status: "denied",
      deniedBy: req.user.email,
      deniedAt: new Date(),
      denialReason: reason || ""
    });
    
    console.log(`✅ Access request denied: ${requestId}`);
    res.json({ success: true, message: "✅ Access request denied" });
  } catch (error) {
    console.error("❌ Error denying access request:", error.message);
    res.status(500).json({ error: "❌ Failed to deny access request" });
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
      return res.status(400).json({ error: "❌ Missing required fields" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
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
    
    console.log(`✅ Emergency access granted: ${emergencyRef.id}`);
    res.json({
      success: true,
      message: "✅ Emergency access granted",
      accessId: emergencyRef.id,
      access: emergencyData
    });
  } catch (error) {
    console.error("❌ Error granting emergency access:", error.message);
    res.status(500).json({ error: "❌ Failed to grant emergency access" });
  }
});

/**
 * Get access requests for patient
 */
router.get("/patient/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
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
    console.error("❌ Error fetching access requests:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch access requests" });
  }
});

/**
 * Doctor access request (POST /doctor_access)
 */
router.post("/doctor_access", async (req, res) => {
  try {
    const { name, patientId, reason } = req.body;
    
    if (!name || !patientId) {
      return res.status(400).json({ error: "❌ Missing required fields: name, patientId" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
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
    
    console.log(`✅ Doctor access request created: ${accessRef.id}`);
    res.json({
      success: true,
      message: "✅ Access request submitted",
      requestId: accessRef.id
    });
  } catch (error) {
    console.error("❌ Error creating doctor access request:", error.message);
    res.status(500).json({ error: "❌ Failed to create access request" });
  }
});

/**
 * Nurse access request (POST /nurse_access)
 */
router.post("/nurse_access", async (req, res) => {
  try {
    const { name, patientId, reason } = req.body;
    
    if (!name || !patientId) {
      return res.status(400).json({ error: "❌ Missing required fields: name, patientId" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
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
    
    console.log(`✅ Nurse access request created: ${accessRef.id}`);
    res.json({
      success: true,
      message: "✅ Access request submitted",
      requestId: accessRef.id
    });
  } catch (error) {
    console.error("❌ Error creating nurse access request:", error.message);
    res.status(500).json({ error: "❌ Failed to create access request" });
  }
});

/**
 * Access precheck endpoint (GET /api/access/precheck)
 */
router.get("/precheck", async (req, res) => {
  try {
    const { patientId, userId } = req.query;
    
    if (!patientId || !userId) {
      return res.status(400).json({ error: "❌ Missing required fields: patientId, userId" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
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
      message: hasAccess ? "✅ Access granted" : "❌ No active access"
    });
  } catch (error) {
    console.error("❌ Error checking access:", error.message);
    res.status(500).json({ error: "❌ Failed to check access" });
  }
});

module.exports = router;
