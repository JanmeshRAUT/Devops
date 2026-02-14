// routes/patientRoutes.js
const express = require("express");
const router = express.Router();
const { db, firebaseInitialized } = require("../firebase");
const { verifyFirebaseToken } = require("../middleware");

/**
 * Create patient record
 */
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientName, age, gender, medicalHistory, emergencyContact } = req.body;
    
    if (!patientName || !age || !gender) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const patientRef = db.collection("patients").doc();
    const patientData = {
      patientName,
      age,
      gender,
      medicalHistory: medicalHistory || [],
      emergencyContact,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.email
    };
    
    await patientRef.set(patientData);
    
    console.log(`✅ Patient record created: ${patientRef.id}`);
    res.json({
      success: true,
      message: "✅ Patient record created",
      patientId: patientRef.id,
      patient: patientData
    });
  } catch (error) {
    console.error("❌ Error creating patient record:", error.message);
    res.status(500).json({ error: "❌ Failed to create patient record" });
  }
});

/**
 * Get patient record
 */
router.get("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const patientDoc = await db.collection("patients").doc(patientId).get();
    
    if (!patientDoc.exists) {
      return res.status(404).json({ error: "❌ Patient not found" });
    }
    
    res.json({ success: true, patient: { id: patientDoc.id, ...patientDoc.data() } });
  } catch (error) {
    console.error("❌ Error fetching patient record:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch patient record" });
  }
});

/**
 * Update patient record
 */
router.put("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    await db.collection("patients").doc(patientId).update(updateData);
    
    console.log(`✅ Patient record updated: ${patientId}`);
    res.json({ success: true, message: "✅ Patient record updated", patient: updateData });
  } catch (error) {
    console.error("❌ Error updating patient record:", error.message);
    res.status(500).json({ error: "❌ Failed to update patient record" });
  }
});

/**
 * Get all patients
 */
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const snapshot = await db.collection("patients").get();
    const patients = [];
    
    snapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, patients, count: patients.length });
  } catch (error) {
    console.error("❌ Error fetching patients:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch patients" });
  }
});

/**
 * Delete patient record
 */
router.delete("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    await db.collection("patients").doc(patientId).delete();
    
    console.log(`✅ Patient record deleted: ${patientId}`);
    res.json({ success: true, message: "✅ Patient record deleted" });
  } catch (error) {
    console.error("❌ Error deleting patient record:", error.message);
    res.status(500).json({ error: "❌ Failed to delete patient record" });
  }
});

module.exports = router;
