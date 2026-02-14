// limiter.js
const rateLimit = require("express-rate-limit");

// Generic rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "❌ Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Strict rate limiter for login attempts
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
  message: "❌ Too many login attempts, please try again later.",
  skipSuccessfulRequests: true // don't count successful requests
});

// OTP rate limiter
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 3 OTP requests per 10 minutes
  message: "❌ Too many OTP requests, please try again later."
});

// Admin limiter
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // less strict for admin operations
  message: "❌ Too many admin requests, please try again later."
});

module.exports = {
  limiter,
  strictLimiter,
  otpLimiter,
  adminLimiter
};
