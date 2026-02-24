// seed.js - Populate database with sample Indian data
const { run, get, all } = require("./database");

const sampleUsers = [
  {
    email: "dr.rajesh@ehr.com",
    name: "Dr. Rajesh Kumar",
    role: "doctor",
    phone: "9876543210",
    department: "Cardiology",
    trustScore: 85
  },
  {
    email: "dr.priya@ehr.com",
    name: "Dr. Priya Sharma",
    role: "doctor",
    phone: "9876543211",
    department: "Neurology",
    trustScore: 90
  },
  {
    email: "nurse.ananya@ehr.com",
    name: "Ananya Verma",
    role: "nurse",
    phone: "9876543212",
    department: "ICU",
    trustScore: 75
  },
  {
    email: "nurse.deepika@ehr.com",
    name: "Deepika Singh",
    role: "nurse",
    phone: "9876543213",
    department: "Emergency",
    trustScore: 80
  },
  {
    email: "patient.amit@ehr.com",
    name: "Amit Patel",
    role: "patient",
    phone: "9876543214",
    trustScore: 50
  },
  {
    email: "patient.neha@ehr.com",
    name: "Neha Desai",
    role: "patient",
    phone: "9876543215",
    trustScore: 55
  },
  {
    email: "admin@ehr.com",
    name: "Admin User",
    role: "admin",
    phone: "9876543216",
    trustScore: 100
  }
];

const samplePatients = [
  {
    patientName: "Arjun Gupta",
    age: 45,
    gender: "Male",
    medicalHistory: "Hypertension, Diabetes",
    emergencyContact: JSON.stringify({ name: "Priya Gupta", phone: "9876543220" }),
    createdBy: "dr.rajesh@ehr.com"
  },
  {
    patientName: "Anjali Nair",
    age: 32,
    gender: "Female",
    medicalHistory: "Asthma",
    emergencyContact: JSON.stringify({ name: "Vikram Nair", phone: "9876543221" }),
    createdBy: "dr.priya@ehr.com"
  },
  {
    patientName: "Rohan Reddy",
    age: 58,
    gender: "Male",
    medicalHistory: "Heart Disease, High Cholesterol",
    emergencyContact: JSON.stringify({ name: "Sunita Reddy", phone: "9876543222" }),
    createdBy: "dr.rajesh@ehr.com"
  },
  {
    patientName: "Meera Joshi",
    age: 28,
    gender: "Female",
    medicalHistory: "None",
    emergencyContact: JSON.stringify({ name: "Hemant Joshi", phone: "9876543223" }),
    createdBy: "dr.priya@ehr.com"
  },
  {
    patientName: "Vikram Singh",
    age: 52,
    gender: "Male",
    medicalHistory: "Arthritis",
    emergencyContact: JSON.stringify({ name: "Kavya Singh", phone: "9876543224" }),
    createdBy: "nurse.ananya@ehr.com"
  },
  {
    patientName: "Divya Sharma",
    age: 35,
    gender: "Female",
    medicalHistory: "Thyroid Issues",
    emergencyContact: JSON.stringify({ name: "Arun Sharma", phone: "9876543225" }),
    createdBy: "dr.rajesh@ehr.com"
  }
];

const sampleAccessLogs = [
  {
    name: "Dr. Rajesh Kumar",
    role: "doctor",
    patientId: 1,
    action: "VIEWED",
    reason: "Regular checkup",
    ip: "192.168.1.100"
  },
  {
    name: "Ananya Verma",
    role: "nurse",
    patientId: 2,
    action: "UPDATED",
    reason: "Updated vitals",
    ip: "192.168.1.101"
  },
  {
    name: "Dr. Priya Sharma",
    role: "doctor",
    patientId: 3,
    action: "VIEWED",
    reason: "Emergency consultation",
    ip: "192.168.1.102"
  },
  {
    name: "Deepika Singh",
    role: "nurse",
    patientId: 4,
    action: "VIEWED",
    reason: "Pre-operative check",
    ip: "192.168.1.103"
  },
  {
    name: "Dr. Rajesh Kumar",
    role: "doctor",
    patientId: 5,
    action: "VIEWED",
    reason: "Routine follow-up",
    ip: "192.168.1.104"
  },
  {
    name: "Ananya Verma",
    role: "nurse",
    patientId: 6,
    action: "UPDATED",
    reason: "Medication update",
    ip: "192.168.1.105"
  }
];

/**
 * Seed the database
 */
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Insert users
    console.log("📝 Inserting sample users with Indian names...");
    for (const user of sampleUsers) {
      try {
        await run(
          `INSERT INTO users (email, name, role, phone, department, trustScore, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [user.email, user.name, user.role, user.phone || null, user.department || null, user.trustScore || 50]
        );
        console.log(`  ✅ Added user: ${user.name} (${user.role})`);
      } catch (err) {
        console.log(`  ℹ️  ${user.name} already exists`);
      }
    }

    // Insert patients
    console.log("\n📋 Inserting sample patients with Indian names...");
    for (const patient of samplePatients) {
      try {
        await run(
          `INSERT INTO patients (patientName, age, gender, medicalHistory, emergencyContact, createdBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [patient.patientName, patient.age, patient.gender, patient.medicalHistory, patient.emergencyContact, patient.createdBy]
        );
        console.log(`  ✅ Added patient: ${patient.patientName} (Age: ${patient.age})`);
      } catch (err) {
        console.log(`  ℹ️  ${patient.patientName} already exists`);
      }
    }

    // Insert access logs
    console.log("\n📊 Inserting sample access logs...");
    for (const log of sampleAccessLogs) {
      try {
        await run(
          `INSERT INTO access_logs (name, role, patientId, action, reason, ip, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
          [log.name, log.role, log.patientId, log.action, log.reason, log.ip]
        );
        console.log(`  ✅ Added log: ${log.name} ${log.action} patient #${log.patientId}`);
      } catch (err) {
        if (!err.message.includes("FOREIGN KEY constraint failed")) {
          console.log(`  ⚠️  ${log.name} log - ${err.message}`);
        }
      }
    }

    console.log("\n✨ Database seeding completed successfully!\n");
    
    // Display summary
    console.log("📊 Database Summary:");
    const userCount = await get("SELECT COUNT(*) as count FROM users");
    const patientCount = await get("SELECT COUNT(*) as count FROM patients");
    const logCount = await get("SELECT COUNT(*) as count FROM access_logs");
    
    console.log(`  • Users: ${userCount.count}`);
    console.log(`  • Patients: ${patientCount.count}`);
    console.log(`  • Access Logs: ${logCount.count}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
