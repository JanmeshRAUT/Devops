// routes/authRoutes.js - SQLite Version
const express = require("express");
const router = express.Router();
const { strictLimiter, otpLimiter } = require("../limiter");
const { sendOtpEmail, generateOTP, isValidEmail, generateToken } = require("../utils");
const { run, get } = require("../database");
const config = require("../config");

// In-memory OTP sessions
const otpSessions = {};

/**
 * Admin login endpoint
 */
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "❌ Email and password required" });
    }
    
    if (email !== config.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, error: "❌ Invalid admin credentials" });
    }

    // Check password against ADMIN_PASSWORD env variable
    if (config.ADMIN_PASSWORD && password !== config.ADMIN_PASSWORD) {
      return res.status(403).json({ success: false, error: "❌ Invalid admin credentials" });
    }

    console.log(`✅ Admin login verified: ${email}`);

    
    const token = generateToken({ email, role: "admin" });
    res.json({ 
      success: true, 
      message: "✅ Admin verified",
      token,
      user: { email, role: "admin" }
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ error: "❌ Internal server error" });
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
    
    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
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
    // Accept both 'email' (new) and 'session_id' (legacy frontend) — session_id equals the user's email
    const { otp } = req.body;
    const email = req.body.email || req.body.session_id;
    
    if (!email || !otp) {
      return res.status(400).json({ error: "❌ Missing email or OTP" });
    }
    
    const session = otpSessions[email];
    
    if (!session) {
      return res.status(400).json({ error: "❌ No active OTP session for this email" });
    }
    
    if (new Date() > session.expiresAt) {
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
    
    try {
      // Check if user exists
      const existingUser = await get(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      
      if (!existingUser) {
        // Create new user
        await run(
          `INSERT INTO users (email, name, role, createdAt, updatedAt, lastLogin)
           VALUES (?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
          [email, session.name, session.role]
        );
      } else {
        // Update last login
        await run(
          "UPDATE users SET lastLogin = datetime('now') WHERE email = ?",
          [email]
        );
      }
      
      delete otpSessions[email];
      
      const token = generateToken({ email, name: session.name, role: session.role });
      
      console.log(`✅ User ${email} verified`);
      res.json({
        success: true,
        verified: true,    // field frontend checks
        message: "✅ OTP verified",
        token,
        user: {
          email,
          name: session.name,
          role: session.role
        }
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
    // Accept both 'email' (new) and 'session_id' (legacy frontend)
    const email = req.body.email || req.body.session_id;
    
    if (!email) {
      return res.status(400).json({ error: "❌ Email is required" });
    }
    
    const session = otpSessions[email];
    
    if (!session) {
      return res.status(400).json({ error: "❌ No active OTP session for this email" });
    }
    
    const newOtp = generateOTP();
    otpSessions[email].otp = newOtp;
    otpSessions[email].expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    otpSessions[email].attempts = 0;
    
    const emailSent = await sendOtpEmail(email, newOtp);
    
    if (!emailSent) {
      return res.status(500).json({ error: "❌ Failed to send OTP email" });
    }
    
    console.log(`✅ OTP resent to ${email}`);
    res.json({ success: true, sent: true, message: "✅ OTP resent to email" });
  } catch (error) {
    console.error("❌ Resend OTP error:", error.message);
    res.status(500).json({ error: "❌ Internal server error" });
  }
});

module.exports = router;
