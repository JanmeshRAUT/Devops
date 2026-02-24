/**
 * firebase.js - SQLite-only backend
 * Firebase has been completely removed and replaced with SQLite + JWT/OTP authentication
 * 
 * This file is kept for backward compatibility but all Firebase functionality
 * has been migrated to SQLite database with JWT token-based authentication.
 */

// SQLite-only backend - No Firebase
const firebaseInitialized = false;

console.log("✅ SQLite backend initialized (Firebase removed)");

module.exports = {
  db: null,
  auth: null,
  firebaseInitialized,
  admin: null
};
