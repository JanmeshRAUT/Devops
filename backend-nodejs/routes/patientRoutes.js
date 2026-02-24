// routes/patientRoutes.js - SQLite Version
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware");
const { run, get, all } = require("../database");

/**
 * Create patient record (POST /add_patient)
 */
router.post("/add_patient", async (req, res) => {
  try {
    const {
      patientName, patient_name, age, gender,
      medicalHistory, emergencyContact,
      email, patient_email,
      diagnosis, treatment, notes,
      doctor_name
    } = req.body;

    const resolvedName = patientName || patient_name;
    const resolvedEmail = email || patient_email || "";

    if (!resolvedName || !age || !gender) {
      return res.status(400).json({ error: "Missing required fields: patientName, age, gender" });
    }

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    await run(
      `INSERT INTO patients 
       (patientName, age, gender, medicalHistory, emergencyContact, createdAt, updatedAt, createdBy,
        patient_email, diagnosis, treatment, notes, doctor_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedName,
        age,
        gender,
        medicalHistory ? JSON.stringify(medicalHistory) : "[]",
        emergencyContact ? JSON.stringify(emergencyContact) : "{}",
        createdAt,
        updatedAt,
        req.user?.email || doctor_name || "system",
        resolvedEmail,
        diagnosis || "",
        treatment || "",
        notes || "",
        doctor_name || req.user?.email || ""
      ]
    );

    console.log("Patient record created:", resolvedName);
    res.json({
      success: true,
      message: "Patient record created",
      patient: {
        patientName: resolvedName,
        age,
        gender,
        email: resolvedEmail,
        diagnosis: diagnosis || "",
        treatment: treatment || "",
        notes: notes || "",
        doctor_name: doctor_name || "",
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
 * Alias: POST / also creates patient
 */
router.post("/", async (req, res) => {
  try {
    const {
      patientName, patient_name, age, gender,
      medicalHistory, emergencyContact,
      email, patient_email,
      diagnosis, treatment, notes,
      doctor_name
    } = req.body;

    const resolvedName = patientName || patient_name;
    const resolvedEmail = email || patient_email || "";

    if (!resolvedName || !age || !gender) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const createdAt = new Date().toISOString();

    await run(
      `INSERT INTO patients 
       (patientName, age, gender, medicalHistory, emergencyContact, createdAt, updatedAt, createdBy,
        patient_email, diagnosis, treatment, notes, doctor_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedName, age, gender,
        medicalHistory ? JSON.stringify(medicalHistory) : "[]",
        emergencyContact ? JSON.stringify(emergencyContact) : "{}",
        createdAt, createdAt,
        req.user?.email || "system",
        resolvedEmail,
        diagnosis || "", treatment || "", notes || "",
        doctor_name || req.user?.email || ""
      ]
    );

    res.json({ success: true, message: "Patient record created", patient: { patientName: resolvedName, age, gender, createdAt } });
  } catch (error) {
    console.error("Error creating patient record:", error.message);
    res.status(500).json({ error: "Failed to create patient record" });
  }
});

/**
 * Get patient record by ID
 */
router.get("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Skip if patientId is a known sub-route
    if (["add_patient", "update_patient", "get_patient"].includes(patientId)) {
      return res.status(404).json({ error: "Not found" });
    }

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
 * Get patient by NAME — NEW (used by DoctorDashboard handleSelectPatient)
 */
router.get("/get_patient/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const patient = await get(
      "SELECT * FROM patients WHERE LOWER(patientName) = LOWER(?) LIMIT 1",
      [name]
    );

    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    res.json({ success: true, patient });
  } catch (error) {
    console.error("Error fetching patient by name:", error.message);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

/**
 * Get patients diagnosed/managed by a specific doctor — NEW (used by DoctorDashboard My Patients tab)
 */
router.get("/doctor_patients/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const patients = await all(
      `SELECT * FROM patients 
       WHERE LOWER(doctor_name) = LOWER(?) OR LOWER(createdBy) = LOWER(?)
       ORDER BY createdAt DESC`,
      [name, name]
    );

    res.json({ success: true, patients, count: patients.length });
  } catch (error) {
    console.error("Error fetching doctor patients:", error.message);
    res.status(500).json({ error: "Failed to fetch doctor patients" });
  }
});

/**
 * Update patient record (PUT /:patientId)
 */
router.put("/:patientId", verifyFirebaseToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;
    const updatedAt = new Date().toISOString();

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updateData);
    values.push(updatedAt);
    values.push(patientId);

    await run(
      `UPDATE patients SET ${fields}, updatedAt = ? WHERE id = ?`,
      values
    );

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
 * Update patient by name or ID (POST /update_patient) — used by DoctorDashboard
 */
router.post("/update_patient", async (req, res) => {
  try {
    const patientId = req.body.patientId || req.body.id;
    const patientName = req.body.patient_name;

    const updates = req.body.updates || { ...req.body };
    // Clean up non-data fields
    delete updates.patientId;
    delete updates.id;
    delete updates.patient_name;
    delete updates.updated_by;

    if (!patientId && !patientName) {
      return res.status(400).json({ error: "Missing patientId or patient_name" });
    }

    const updatedAt = new Date().toISOString();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    values.push(updatedAt);

    let sql, sqlParams;
    if (patientId) {
      sql = `UPDATE patients SET ${fields}, updatedAt = ? WHERE id = ?`;
      sqlParams = [...values, patientId];
    } else {
      sql = `UPDATE patients SET ${fields}, updatedAt = ? WHERE LOWER(patientName) = LOWER(?)`;
      sqlParams = [...values, patientName];
    }

    await run(sql, sqlParams);

    // Get the updated patient record
    let patient = null;
    if (patientId) {
      patient = await get("SELECT * FROM patients WHERE id = ?", [patientId]);
    } else {
      patient = await get("SELECT * FROM patients WHERE LOWER(patientName) = LOWER(?) LIMIT 1", [patientName]);
    }

    console.log("Patient record updated:", patientName || patientId);
    res.json({
      success: true,
      message: "Patient record updated",
      patient: patient || { ...updates, updatedAt }
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

    await run("DELETE FROM patients WHERE id = ?", [patientId]);

    console.log("Patient record deleted:", patientId);
    res.json({ success: true, message: "Patient record deleted" });
  } catch (error) {
    console.error("Error deleting patient record:", error.message);
    res.status(500).json({ error: "Failed to delete patient record" });
  }
});

module.exports = router;
