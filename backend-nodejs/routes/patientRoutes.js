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
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    
    await run(
      `INSERT INTO patients (patientName, age, gender, medicalHistory, emergencyContact, createdAt, updatedAt, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientName,
        age,
        gender,
        medicalHistory ? JSON.stringify(medicalHistory) : "[]",
        emergencyContact ? JSON.stringify(emergencyContact) : "{}",
        createdAt,
        updatedAt,
        req.user?.email || "system"
      ]
    );
    
    console.log("Patient record created");
    res.json({
      success: true,
      message: "Patient record created",
      patient: {
        patientName,
        age,
        gender,
        medicalHistory: medicalHistory || [],
        emergencyContact: emergencyContact || {},
        createdAt,
        updatedAt
      }
    });
  } catch (error) {
    console.error("Error creating patient record:", error.message);
    res.status(500).json({ error: "Failed to create patient record" });
  }
});

/**
 * Alias for add_patient (POST /add_patient)
 */
router.post("/add_patient", async (req, res) => {
  try {
    const { patientName, age, gender, medicalHistory, emergencyContact } = req.body;
    
    if (!patientName || !age || !gender) {
      return res.status(400).json({ error: "Missing required fields: patientName, age, gender" });
    }
    
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    
    await run(
      `INSERT INTO patients (patientName, age, gender, medicalHistory, emergencyContact, createdAt, updatedAt, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientName,
        age,
        gender,
        medicalHistory ? JSON.stringify(medicalHistory) : "[]",
        emergencyContact ? JSON.stringify(emergencyContact) : "{}",
        createdAt,
        updatedAt,
        req.user?.email || "system"
      ]
    );
    
    console.log("Patient record created");
    res.json({
      success: true,
      message: "Patient record created",
      patient: {
        patientName,
        age,
        gender,
        medicalHistory: medicalHistory || [],
        emergencyContact: emergencyContact || {},
        createdAt,
        updatedAt
      }
    });
  } catch (error) {
    console.error("Error creating patient record:", error.message);
    res.status(500).json({ error: "Failed to create patient record" });
  }
});

/**
 * Get patient record
 */
router.get("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await get(
      "SELECT * FROM patients WHERE id = ?",
      [patientId]
    );
    
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    res.json({ success: true, patient });
  } catch (error) {
    console.error("Error fetching patient record:", error.message);
    res.status(500).json({ error: "Failed to fetch patient record" });
  }
});

/**
 * Update patient record
 */
router.put("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;
    const updatedAt = new Date().toISOString();
    
    // Build dynamic UPDATE query
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updateData);
    values.push(updatedAt);
    values.push(patientId);
    
    await run(
      `UPDATE patients SET ${fields}, updatedAt = ? WHERE id = ?`,
      values
    );
    
    console.log("Patient record updated:", patientId);
    res.json({ 
      success: true, 
      message: "Patient record updated", 
      patient: { id: patientId, ...updateData, updatedAt } 
    });
  } catch (error) {
    console.error("Error updating patient record:", error.message);
    res.status(500).json({ error: "Failed to update patient record" });
  }
});

/**
 * Alias for update_patient (POST /update_patient)
 */
router.post("/update_patient", async (req, res) => {
  try {
    const patientId = req.body.patientId || req.body.id;
    
    if (!patientId) {
      return res.status(400).json({ error: "Missing patientId" });
    }
    
    const updateData = { ...req.body };
    delete updateData.patientId;
    delete updateData.id;
    
    const updatedAt = new Date().toISOString();
    
    // Build dynamic UPDATE query
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updateData);
    values.push(updatedAt);
    values.push(patientId);
    
    await run(
      `UPDATE patients SET ${fields}, updatedAt = ? WHERE id = ?`,
      values
    );
    
    console.log("Patient record updated:", patientId);
    res.json({ 
      success: true, 
      message: "Patient record updated", 
      patient: { id: patientId, ...updateData, updatedAt } 
    });
  } catch (error) {
    console.error("Error updating patient record:", error.message);
    res.status(500).json({ error: "Failed to update patient record" });
  }
});

/**
 * Get all patients
 */
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const patients = await all("SELECT * FROM patients");
    res.json({ success: true, patients, count: patients.length });
  } catch (error) {
    console.error("Error fetching patients:", error.message);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

/**
 * Delete patient record
 */
router.delete("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    await run(
      "DELETE FROM patients WHERE id = ?",
      [patientId]
    );
    
    console.log("Patient record deleted:", patientId);
    res.json({ success: true, message: "Patient record deleted" });
  } catch (error) {
    console.error("Error deleting patient record:", error.message);
    res.status(500).json({ error: "Failed to delete patient record" });
  }
});

module.exports = router;

