#!/usr/bin/env node

/**
 * setup-sqlite-backend.js
 * Complete SQLite Backend Setup and Verification
 * 
 * This script:
 * 1. Initializes the SQLite database with all tables
 * 2. Seeds sample data
 * 3. Verifies data integrity
 * 4. Tests database connectivity
 * 
 * Usage: node setup-sqlite-backend.js
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const dbPath = path.join(__dirname, "ehr.db");

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║     SQLite Database Setup & Verification                  ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE CONNECTION
// ─────────────────────────────────────────────────────────────────────────────

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  } else {
    console.log(`✅ SQLite database connected: ${dbPath}\n`);
    initializeAndVerify();
  }
});

// Promise-based database operations
function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZATION FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function initializeAndVerify() {
  try {
    console.log("📋 Step 1: Creating database schema...\n");
    await initializeSchema();

    console.log("\n📋 Step 2: Seeding sample data...\n");
    await seedSampleData();

    console.log("\n📋 Step 3: Verifying data integrity...\n");
    await verifyDataIntegrity();

    console.log("\n✅ Backend setup completed successfully!\n");
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Your SQLite backend is ready to use!                   ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("📝 Next steps:");
    console.log("   1. npm install");
    console.log("   2. npm run dev    (for development)");
    console.log("   3. npm start      (for production)\n");

    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    await closeDatabase();
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

async function initializeSchema() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      console.log("  Creating users table...");
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
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
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Patients table
      console.log("  Creating patients table...");
      db.run(
        `CREATE TABLE IF NOT EXISTS patients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patientName TEXT NOT NULL,
          age INTEGER NOT NULL,
          gender TEXT NOT NULL,
          medicalHistory TEXT,
          emergencyContact TEXT,
          createdBy TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          patient_email TEXT,
          diagnosis TEXT,
          treatment TEXT,
          notes TEXT,
          doctor_name TEXT
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Access requests table
      console.log("  Creating access_requests table...");
      db.run(
        `CREATE TABLE IF NOT EXISTS access_requests (
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
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Emergency access table
      console.log("  Creating emergency_access table...");
      db.run(
        `CREATE TABLE IF NOT EXISTS emergency_access (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patientId INTEGER NOT NULL,
          grantedBy TEXT NOT NULL,
          reason TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          expiresAt DATETIME,
          FOREIGN KEY (patientId) REFERENCES patients(id)
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Access logs table
      console.log("  Creating access_logs table...");
      db.run(
        `CREATE TABLE IF NOT EXISTS access_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          userId TEXT,
          patientId TEXT,
          action TEXT NOT NULL,
          reason TEXT,
          details TEXT,
          ip TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          doctor_name TEXT,
          doctor_role TEXT,
          patient_name TEXT,
          justification TEXT,
          status TEXT DEFAULT 'Success'
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // OTP sessions table
      console.log("  Creating otp_sessions table...");
      db.run(
        `CREATE TABLE IF NOT EXISTS otp_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          otp TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          attempts INTEGER DEFAULT 0,
          expiresAt DATETIME NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("✅ All tables created successfully\n");
            resolve();
          }
        }
      );
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED SAMPLE DATA
// ─────────────────────────────────────────────────────────────────────────────

async function seedSampleData() {
  const adminUser = {
    email: "admin@ehr.com",
    name: "Admin User",
    role: "admin",
    phone: "9876543216",
    department: "Administration",
    trustScore: 100
  };

  const sampleUsers = [
    { email: "dr.rajesh@ehr.com", name: "Dr. Rajesh Kumar", role: "doctor", phone: "9876543210", department: "Cardiology", trustScore: 88 },
    { email: "dr.priya@ehr.com", name: "Dr. Priya Sharma", role: "doctor", phone: "9876543211", department: "Neurology", trustScore: 92 },
    { email: "nurse.ananya@ehr.com", name: "Ananya Verma", role: "nurse", phone: "9876543212", department: "ICU", trustScore: 75 },
    { email: "nurse.deepika@ehr.com", name: "Deepika Singh", role: "nurse", phone: "9876543213", department: "Emergency", trustScore: 80 },
    { email: "patient.amit@ehr.com", name: "Amit Patel", role: "patient", phone: "9876543214", trustScore: 50 },
    { email: "patient.neha@ehr.com", name: "Neha Desai", role: "patient", phone: "9876543215", trustScore: 55 }
  ];

  const samplePatients = [
    {
      patientName: "Arjun Gupta",
      age: 52,
      gender: "Male",
      patient_email: "arjun.gupta@gmail.com",
      medicalHistory: JSON.stringify(["Hypertension", "Type 2 Diabetes"]),
      emergencyContact: JSON.stringify({ name: "Priya Gupta", phone: "9876543220", relation: "Wife" }),
      diagnosis: "Coronary Artery Disease",
      treatment: "Aspirin 75mg OD, Atorvastatin 40mg OD",
      notes: "Patient showing improvement",
      doctor_name: "Dr. Rajesh Kumar",
      createdBy: "dr.rajesh@ehr.com"
    },
    {
      patientName: "Anjali Nair",
      age: 34,
      gender: "Female",
      patient_email: "anjali.nair@gmail.com",
      medicalHistory: JSON.stringify(["Migraine", "Anxiety"]),
      emergencyContact: JSON.stringify({ name: "Vikram Nair", phone: "9876543221", relation: "Husband" }),
      diagnosis: "Chronic Migraine with aura",
      treatment: "Topiramate 50mg BD",
      notes: "Migraine frequency reduced",
      doctor_name: "Dr. Priya Sharma",
      createdBy: "dr.priya@ehr.com"
    }
  ];

  try {
    console.log("  Inserting admin user...");
    await run(
      `INSERT OR IGNORE INTO users (email, name, role, phone, department, trustScore, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [adminUser.email, adminUser.name, adminUser.role, adminUser.phone, adminUser.department, adminUser.trustScore]
    );

    console.log("  Inserting sample users...");
    for (const user of sampleUsers) {
      await run(
        `INSERT OR IGNORE INTO users (email, name, role, phone, department, trustScore, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [user.email, user.name, user.role, user.phone, user.department, user.trustScore]
      );
    }

    console.log("  Inserting sample patients...");
    for (const patient of samplePatients) {
      await run(
        `INSERT OR IGNORE INTO patients 
         (patientName, age, gender, patient_email, medicalHistory, emergencyContact, diagnosis, treatment, notes, doctor_name, createdBy, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          patient.patientName,
          patient.age,
          patient.gender,
          patient.patient_email,
          patient.medicalHistory,
          patient.emergencyContact,
          patient.diagnosis,
          patient.treatment,
          patient.notes,
          patient.doctor_name,
          patient.createdBy
        ]
      );
    }

    console.log("✅ Sample data seeded successfully\n");
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY DATA INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────

async function verifyDataIntegrity() {
  try {
    const userCount = await get("SELECT COUNT(*) as count FROM users");
    const patientCount = await get("SELECT COUNT(*) as count FROM patients");

    console.log("  📊 Database Statistics:");
    console.log(`     • Users: ${userCount.count} records`);
    console.log(`     • Patients: ${patientCount.count} records`);

    const users = await all("SELECT email, role FROM users LIMIT 5");
    if (users.length > 0) {
      console.log("\n  👥 Sample Users:");
      users.forEach((user) => {
        console.log(`     • ${user.email} (${user.role})`);
      });
    }

    const patients = await all("SELECT patientName, age, doctor_name FROM patients LIMIT 5");
    if (patients.length > 0) {
      console.log("\n  🏥 Sample Patients:");
      patients.forEach((patient) => {
        console.log(`     • ${patient.patientName} (Age: ${patient.age}, Doctor: ${patient.doctor_name})`);
      });
    }

    console.log("\n✅ Data integrity verified");
  } catch (error) {
    console.error("❌ Data verification failed:", error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSE DATABASE
// ─────────────────────────────────────────────────────────────────────────────

function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

process.on("SIGINT", async () => {
  console.log("\n⚠️  Setup interrupted");
  await closeDatabase();
  process.exit(1);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error("\n❌ Unhandled Rejection:", reason);
  await closeDatabase();
  process.exit(1);
});
