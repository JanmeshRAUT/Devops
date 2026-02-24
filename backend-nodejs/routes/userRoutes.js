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
    
    if (name) {
      updates.push("name = ?");
      params.push(name);
    }
    if (phone) {
      updates.push("phone = ?");
      params.push(phone);
    }
    if (department) {
      updates.push("department = ?");
      params.push(department);
    }
    
    updates.push("updatedAt = datetime('now')");
    params.push(email);
    
    await run(
      `UPDATE users SET ${updates.join(", ")} WHERE email = ?`,
      params
    );
    
    console.log(`✅ User ${email} profile updated`);
    res.json({ success: true, message: "✅ Profile updated" });
  } catch (error) {
    console.error("❌ Error updating user profile:", error.message);
    res.status(500).json({ error: "❌ Failed to update profile" });
  }
});

/**
 * Get all users (admin only)
 */
router.get("/all", verifyFirebaseToken, async (req, res) => {
  try {
    const users = await all("SELECT * FROM users");
    
    res.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ error: "❌ Failed to fetch users" });
  }
});

/**
 * Delete user account
 */
router.delete("/account", verifyFirebaseToken, async (req, res) => {
  try {
    const email = req.user.email;
    
    await run("DELETE FROM users WHERE email = ?", [email]);
    
    console.log(`✅ User ${email} account deleted`);
    res.json({ success: true, message: "✅ Account deleted" });
  } catch (error) {
    console.error("❌ Error deleting account:", error.message);
    res.status(500).json({ error: "❌ Failed to delete account" });
  }
});

/**
 * Delete user by email (DELETE /delete_user/:email)
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
