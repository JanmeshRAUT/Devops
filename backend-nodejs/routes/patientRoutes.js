// routes/patientRoutes.js - SQLite Version
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware");
const { run, get, all } = require("../database");

/**
 * Create patient record (supports both POST / and POST /add_patient)
 */
router.post("/", async (req, res) => {
  try {
    const { patientName, age, gender, medicalHistory, emergencyContact } = req.body;
    
    if (!patientName || !age || !gender) {
      return res.status(400).json({ error: "âŒ Missing required fields" });
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
      createdBy: req.user?.email || "system"
    };
    
    await patientRef.set(patientData);
    
    console.log(`âœ… Patient record created: ${patientRef.id}`);
    res.json({
      success: true,
      message: "âœ… Patient record created",
      patientId: patientRef.id,
      patient: patientData
    });
  } catch (error) {
    console.error("âŒ Error creating patient record:", error.message);
    res.status(500).json({ error: "âŒ Failed to create patient record" });
  }
});

/**
 * Alias for add_patient (POST /add_patient)
 */
router.post("/add_patient", async (req, res) => {
  try {
    const { patientName, age, gender, medicalHistory, emergencyContact } = req.body;
    
    if (!patientName || !age || !gender) {
      return res.status(400).json({ error: "âŒ Missing required fields: patientName, age, gender" });
    }
    
    
    const patientRef = db.collection("patients").doc();
    const patientData = {
      patientName,
      age,
      gender,
      medicalHistory: medicalHistory || [],
      emergencyContact: emergencyContact || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user?.email || "system"
    };
    
    await patientRef.set(patientData);
    
    console.log(`âœ… Patient record created: ${patientRef.id}`);
    res.json({
      success: true,
      message: "âœ… Patient record created",
      patientId: patientRef.id,
      patient: { id: patientRef.id, ...patientData }
    });
  } catch (error) {
    console.error("âŒ Error creating patient record:", error.message);
    res.status(500).json({ error: "âŒ Failed to create patient record" });
  }
});

/**
 * Get patient record
 */
router.get("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    
    const patientDoc = await db.collection("patients").doc(patientId).get();
    
    if (!patientDoc.exists) {
      return res.status(404).json({ error: "âŒ Patient not found" });
    }
    
    res.json({ success: true, patient: { id: patientDoc.id, ...patientDoc.data() } });
  } catch (error) {
    console.error("âŒ Error fetching patient record:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch patient record" });
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
    
    
    await db.collection("patients").doc(patientId).update(updateData);
    
    console.log(`âœ… Patient record updated: ${patientId}`);
    res.json({ success: true, message: "âœ… Patient record updated", patient: updateData });
  } catch (error) {
    console.error("âŒ Error updating patient record:", error.message);
    res.status(500).json({ error: "âŒ Failed to update patient record" });
  }
});

/**
 * Alias for update_patient (POST /update_patient)
 */
router.post("/update_patient", async (req, res) => {
  try {
    const patientId = req.body.patientId || req.body.id;
    
    if (!patientId) {
      return res.status(400).json({ error: "âŒ Missing patientId" });
    }
    
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // Remove id/patientId from update data if present
    delete updateData.patientId;
    delete updateData.id;
    
    await db.collection("patients").doc(patientId).update(updateData);
    
    console.log(`âœ… Patient record updated: ${patientId}`);
    res.json({ success: true, message: "âœ… Patient record updated", patient: { id: patientId, ...updateData } });
  } catch (error) {
    console.error("âŒ Error updating patient record:", error.message);
    res.status(500).json({ error: "âŒ Failed to update patient record" });
  }
});

/**
 * Get all patients
 */
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    
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
    console.error("âŒ Error fetching patients:", error.message);
    res.status(500).json({ error: "âŒ Failed to fetch patients" });
  }
});

/**
 * Delete patient record
 */
router.delete("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    
    await db.collection("patients").doc(patientId).delete();
    
    console.log(`âœ… Patient record deleted: ${patientId}`);
    res.json({ success: true, message: "âœ… Patient record deleted" });
  } catch (error) {
    console.error("âŒ Error deleting patient record:", error.message);
    res.status(500).json({ error: "âŒ Failed to delete patient record" });
  }
});

module.exports = router;

