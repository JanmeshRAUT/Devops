// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { db, firebaseInitialized } = require("../firebase");
const { verifyFirebaseToken } = require("../middleware");

/**
 * Get user profile
 */
router.get("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const email = req.user.email;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const userDoc = await db.collection("users").doc(email).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "❌ User not found" });
    }
    
    res.json({ success: true, user: userDoc.data() });
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
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    updateData.updatedAt = new Date();
    
    await db.collection("users").doc(email).update(updateData);
    
    console.log(`✅ User ${email} profile updated`);
    res.json({ success: true, message: "✅ Profile updated", user: updateData });
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
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const snapshot = await db.collection("users").get();
    const users = [];
    
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
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
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    await db.collection("users").doc(email).delete();
    
    console.log(`✅ User ${email} account deleted`);
    res.json({ success: true, message: "✅ Account deleted" });
  } catch (error) {
    console.error("❌ Error deleting account:", error.message);
    res.status(500).json({ error: "❌ Failed to delete account" });
  }
});

module.exports = router;
