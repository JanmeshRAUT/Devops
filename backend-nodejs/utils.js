// utils.js
const nodemailer = require("nodemailer");
const config = require("./config");
const crypto = require("crypto");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL_SENDER,
    pass: config.EMAIL_PASSWORD
  }
});

/**
 * Send OTP email
 */
async function sendOtpEmail(email, otp) {
  try {
    const mailOptions = {
      from: config.EMAIL_SENDER,
      to: email,
      subject: "Your OTP for EHR System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333;">Your OTP Code</h2>
          <p>Your One-Time Password is:</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center;">
            <h1 style="color: #007bff; letter-spacing: 2px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; margin-top: 20px;">This OTP is valid for 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return false;
  }
}

/**
 * Generate random OTP
 */
function generateOTP(length = 6) {
  return crypto.randomBytes(3).toString("hex").slice(0, length).toUpperCase();
}

/**
 * Hash password
 */
async function hashPassword(password) {
  const bcrypt = require("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Compare password
 */
async function comparePassword(password, hash) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
function generateToken(payload, expiresIn = "24h") {
  const jwt = require("jsonwebtoken");
  return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", { expiresIn });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  const jwt = require("jsonwebtoken");
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (error) {
    return null;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Log access event
 */
async function logAccessEvent(db, userId, action, details = {}) {
  try {
    await db.collection("access_logs").add({
      userId,
      action,
      details,
      timestamp: new Date(),
      ip: details.ip || "unknown"
    });
  } catch (error) {
    console.error("❌ Failed to log access event:", error.message);
  }
}

module.exports = {
  sendOtpEmail,
  generateOTP,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  isValidEmail,
  logAccessEvent
};
