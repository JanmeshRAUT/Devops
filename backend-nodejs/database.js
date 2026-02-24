// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'ehr.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ SQLite database connected');
    initializeDatabase();
  }
});

/**
 * Run database query with callback
 */
function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * Get single row
 */
function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Get all rows
 */
function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Initialize database schema
 */
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        department TEXT,
        trustScore INTEGER DEFAULT 50,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLogin DATETIME
      )
    `);

    // Patients table
    db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientName TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        medicalHistory TEXT,
        emergencyContact TEXT,
        createdBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Access requests table
    db.run(`
      CREATE TABLE IF NOT EXISTS access_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        requesterId TEXT NOT NULL,
        role TEXT NOT NULL,
        accessType TEXT,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        approvedBy TEXT,
        approvedAt DATETIME,
        deniedBy TEXT,
        deniedAt DATETIME,
        denialReason TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiresAt DATETIME,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `);

    // Emergency access table
    db.run(`
      CREATE TABLE IF NOT EXISTS emergency_access (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        grantedBy TEXT NOT NULL,
        reason TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiresAt DATETIME,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `);

    // Access logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        userId TEXT,
        patientId INTEGER,
        action TEXT NOT NULL,
        reason TEXT,
        details TEXT,
        ip TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientId) REFERENCES patients(id)
      )
    `);

    // OTP sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS otp_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        otp TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database schema initialized');
  });
}

/**
 * Close database connection
 */
function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
  });
}

module.exports = {
  db,
  run,
  get,
  all,
  closeDatabase
};
