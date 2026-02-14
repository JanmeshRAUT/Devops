// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { auth, db, firebaseInitialized } = require("../firebase");
const { strictLimiter, otpLimiter } = require("../limiter");
const { sendOtpEmail, generateOTP, isValidEmail } = require("../utils");
const config = require("../config");

// In-memory OTP sessions
const otpSessions = {};

/**
 * Admin login endpoint
 */
router.post("/admin/login", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "❌ Missing token" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const decoded = await auth.verifyIdToken(token);
    const email = decoded.email;
    
    if (email === config.ADMIN_EMAIL) {
      console.log(`✅ Admin verified: ${email}`);
      return res.json({ success: true, message: "✅ Admin verified" });
    }
    
    console.log(`🚫 Unauthorized admin attempt: ${email}`);
    return res.status(403).json({ success: false, error: "❌ Not an admin" });
  } catch (error) {
    console.error("❌ Token error:", error.message);
    res.status(401).json({ error: "❌ Invalid or expired token" });
  }
});

/**
 * User login endpoint
 */
router.post("/user_login", strictLimiter, async (req, res) => {
  try {
    const { name, role, email } = req.body;
    
    // Validate required fields
    if (!name || !role || !email) {
      return res.status(400).json({ error: "❌ Missing required fields: name, role, email" });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "❌ Invalid email format" });
    }
    
    const validRoles = ["doctor", "nurse", "patient"];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ error: `❌ Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    otpSessions[email] = {
      otp,
      expiresAt,
      name,
      role: role.toLowerCase(),
      attempts: 0
    };
    
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      delete otpSessions[email];
      return res.status(500).json({ error: "❌ Failed to send OTP email" });
    }
    
    console.log(`✅ OTP sent to ${email}`);
    res.json({
      success: true,
      message: "✅ OTP sent to email",
      sessionId: email
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ error: "❌ Internal server error" });
  }
});

/**
 * Verify OTP endpoint
 */
router.post("/verify_otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: "❌ Missing email or OTP" });
    }
    
    const session = otpSessions[email];
    
    if (!session) {
      return res.status(400).json({ error: "❌ No active OTP session for this email" });
    }
    
    if (Date.now() > session.expiresAt) {
      delete otpSessions[email];
      return res.status(400).json({ error: "❌ OTP expired" });
    }
    
    session.attempts += 1;
    if (session.attempts > 3) {
      delete otpSessions[email];
      return res.status(400).json({ error: "❌ Too many OTP attempts" });
    }
    
    if (session.otp !== otp) {
      return res.status(400).json({ error: "❌ Invalid OTP" });
    }
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    // Create or update user record in Firestore
    try {
      const userRef = db.collection("users").doc(email);
      const userDoc = await userRef.get();
      
      const userData = {
        email,
        name: session.name,
        role: session.role,
        lastLogin: new Date(),
        ...(userDoc.exists ? {} : { createdAt: new Date() })
      };
      
      await userRef.set(userData, { merge: true });
      
      delete otpSessions[email];
      
      console.log(`✅ User ${email} verified`);
      res.json({
        success: true,
        message: "✅ OTP verified",
        user: userData
      });
    } catch (dbError) {
      console.error("❌ Database error:", dbError.message);
      res.status(500).json({ error: "❌ Failed to create user record" });
    }
  } catch (error) {
    console.error("❌ OTP verification error:", error.message);
    res.status(500).json({ error: "❌ Internal server error" });
  }
});

/**
 * Logout endpoint
 */
router.post("/logout", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (email && otpSessions[email]) {
      delete otpSessions[email];
    }
    
    res.json({ success: true, message: "✅ Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error.message);
    res.status(500).json({ error: "❌ Logout failed" });
  }
});

/**
 * Resend OTP endpoint
 */
router.post("/resend_otp", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "❌ Email is required" });
    }
    
    const session = otpSessions[email];
    
    if (!session) {
      return res.status(400).json({ error: "❌ No active OTP session for this email" });
    }
    
    const newOtp = generateOTP();
    otpSessions[email].otp = newOtp;
    otpSessions[email].expiresAt = Date.now() + 10 * 60 * 1000;
    otpSessions[email].attempts = 0;
    
    const emailSent = await sendOtpEmail(email, newOtp);
    
    if (!emailSent) {
      return res.status(500).json({ error: "❌ Failed to send OTP email" });
    }
    
    console.log(`✅ OTP resent to ${email}`);
    res.json({ success: true, message: "✅ OTP resent to email" });
  } catch (error) {
    console.error("❌ Resend OTP error:", error.message);
    res.status(500).json({ error: "❌ Internal server error" });
  }
});

module.exports = router;
