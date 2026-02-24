// routes/userRoutes.js - SQLite Version
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware");
const { run, get, all } = require("../database");

/**
 * Get user profile
 */
router.get("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const email = req.user.email;

    const user = await get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(404).json({ error: "❌ User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch user profile" });
  }
});

/**
 * Update user profile
 */
router.put("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const email = req.user.email;
    const { name, phone, department } = req.body;

    const updates = [];
    const params = [];

    if (name) { updates.push("name = ?"); params.push(name); }
    if (phone) { updates.push("phone = ?"); params.push(phone); }
    if (department) { updates.push("department = ?"); params.push(department); }

    updates.push("updatedAt = datetime('now')");
    params.push(email);

    await run(
      `UPDATE users SET ${updates.join(", ")} WHERE email = ?`,
      params
    );

    res.json({ success: true, message: "✅ Profile updated" });
  } catch (error) {
    console.error("❌ Error updating user profile:", error.message);
    res.status(500).json({ error: "❌ Failed to update profile" });
  }
});

/**
 * Get all users (admin only)
 */
router.get("/all", async (req, res) => {
  try {
    const users = await all("SELECT * FROM users");
    res.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch users" });
  }
});

/**
 * Register a new user — NEW (used by Admin UserManagement)
 * POST /api/users/register_user  OR  /register_user (root alias)
 */
router.post("/register_user", async (req, res) => {
  try {
    const { name, email, role, age, gender, dob, contact, blood_group, address } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Missing required fields: name, email, role" });
    }

    const validRoles = ["doctor", "nurse", "patient", "admin"];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    // Check if user already exists
    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return res.status(409).json({ success: false, error: "❌ User with this email already exists" });
    }

    const createdAt = new Date().toISOString();
    await run(
      `INSERT INTO users (email, name, role, createdAt, updatedAt, lastLogin)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, name, role.toLowerCase(), createdAt, createdAt, createdAt]
    );

    // If role is 'patient', also create a patient record
    if (role.toLowerCase() === "patient" && age) {
      await run(
        `INSERT INTO patients (patientName, age, gender, createdAt, updatedAt, createdBy, patient_email)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, parseInt(age) || 0, gender || "Not specified", createdAt, createdAt, "admin", email]
      ).catch(err => console.warn("Patient record creation skipped:", err.message));
    }

    console.log(`✅ User registered: ${email} as ${role}`);
    res.json({
      success: true,
      message: `✅ User ${name} registered as ${role}`,
      user: { name, email, role: role.toLowerCase(), createdAt }
    });
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    res.status(500).json({ error: "❌ Failed to register user" });
  }
});

/**
 * Assign role to user — NEW (used by Admin UserManagement edit)
 * POST /api/users/assign_role  OR  /assign_role (root alias)
 */
router.post("/assign_role", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Missing required fields: email, role" });
    }

    const validRoles = ["doctor", "nurse", "patient", "admin"];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    const user = await get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      // Create user if not found
      const now = new Date().toISOString();
      await run(
        `INSERT INTO users (email, name, role, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?)`,
        [email, name || email.split("@")[0], role.toLowerCase(), now, now]
      );
      console.log(`✅ New user created with role: ${email} → ${role}`);
    } else {
      // Update existing user's role
      await run(
        "UPDATE users SET role = ?, name = ?, updatedAt = datetime('now') WHERE email = ?",
        [role.toLowerCase(), name || user.name, email]
      );
      console.log(`✅ Role updated: ${email} → ${role}`);
    }

    res.json({
      success: true,
      message: `✅ Role updated to ${role} for ${name || email}`
    });
  } catch (error) {
    console.error("❌ Error assigning role:", error.message);
    res.status(500).json({ error: "❌ Failed to assign role" });
  }
});

/**
 * Delete user account (self)
 */
router.delete("/account", verifyFirebaseToken, async (req, res) => {
  try {
    const email = req.user.email;

    await run("DELETE FROM users WHERE email = ?", [email]);

    res.json({ success: true, message: "✅ Account deleted" });
  } catch (error) {
    console.error("❌ Error deleting account:", error.message);
    res.status(500).json({ error: "❌ Failed to delete account" });
  }
});

/**
 * Delete user by email (DELETE /delete_user/:email) — used by UserManagement
 */
router.delete("/delete_user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "❌ Email is required" });
    }

    await run("DELETE FROM users WHERE email = ?", [email]);

    console.log(`✅ User ${email} deleted`);
    res.json({ success: true, message: "✅ User deleted" });
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    res.status(500).json({ error: "❌ Failed to delete user" });
  }
});

module.exports = router;
