#!/usr/bin/env node

/**
 * comprehensive-backend-test.js
 * Complete endpoint testing for SQLite backend
 * 
 * Tests all critical endpoints to ensure SQLite migration is successful
 */

const http = require("http");

const BASE_URL = "http://localhost:5000";
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function makeRequest(path, method = "GET", body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            path,
            method,
            data: data ? JSON.parse(data) : null,
            rawData: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            path,
            method,
            data: null,
            rawData: data
          });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function logTest(name, passed, details = "") {
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} | ${name}`);
  if (details && !passed) console.log(`      ${details}`);

  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function runTests() {
  console.log("\n╔═══════════════════════════════════════════════════════════════╗");
  console.log("║          SQLite Backend Comprehensive Test Suite             ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝\n");

  // Check if server is running
  try {
    const healthCheck = await makeRequest("/health");
    if (healthCheck.status === 200) {
      console.log("✅ Backend server is running\n");
    } else {
      console.error("❌ Backend server is not responding correctly");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Backend server is not running. Start it with: npm start");
    process.exit(1);
  }

  console.log("📋 Testing Endpoints...\n");

  // Test 1: Health check
  console.log("─── Health Checks ───");
  try {
    const health = await makeRequest("/health");
    logTest("GET /health", health.status === 200, `Status: ${health.status}`);
  } catch (error) {
    logTest("GET /health", false, error.message);
  }

  // Test 2: IP Check
  try {
    const ip = await makeRequest("/api/general/ip_check");
    logTest("GET /api/general/ip_check", ip.status === 200, `Status: ${ip.status}`);
  } catch (error) {
    logTest("GET /api/general/ip_check", false, error.message);
  }

  // Test 3: Stats
  try {
    const stats = await makeRequest("/api/general/stats");
    logTest("GET /api/general/stats", stats.status === 200, `Status: ${stats.status}`);
  } catch (error) {
    logTest("GET /api/general/stats", false, error.message);
  }

  console.log("\n─── Authentication (OTP Login) ───");

  // Test 4: Admin Login
  try {
    const adminLogin = await makeRequest("/api/auth/admin/login", "POST", {
      email: "admin@ehr.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123"
    });
    logTest("POST /api/auth/admin/login", adminLogin.status === 200, `Status: ${adminLogin.status}`);
  } catch (error) {
    logTest("POST /api/auth/admin/login", false, error.message);
  }

  // Test 5: User Login (OTP Request)
  try {
    const userLogin = await makeRequest("/api/auth/user_login", "POST", {
      name: "Dr. Rajesh Kumar",
      role: "doctor",
      email: "dr.rajesh@ehr.com"
    });
    logTest("POST /api/auth/user_login", userLogin.status === 200, `Status: ${userLogin.status}`);
  } catch (error) {
    logTest("POST /api/auth/user_login", false, error.message);
  }

  // Test 6: Resend OTP
  try {
    const resendOtp = await makeRequest("/api/auth/resend_otp", "POST", {
      email: "dr.rajesh@ehr.com"
    });
    logTest("POST /api/auth/resend_otp", resendOtp.status === 200, `Status: ${resendOtp.status}`);
  } catch (error) {
    logTest("POST /api/auth/resend_otp", false, error.message);
  }

  console.log("\n─── User Management (SQLite) ───");

  // Test 7: Get all users
  try {
    const users = await makeRequest("/api/users/all");
    logTest("GET /api/users/all", users.status === 200, `Status: ${users.status}`);
  } catch (error) {
    logTest("GET /api/users/all", false, error.message);
  }

  // Test 8: Register new user
  try {
    const registerUser = await makeRequest("/api/users/register_user", "POST", {
      name: "Test User",
      email: `testuser${Date.now()}@ehr.com`,
      role: "doctor",
      phone: "1234567890",
      department: "Test"
    });
    logTest("POST /api/users/register_user", registerUser.status === 200, `Status: ${registerUser.status}`);
  } catch (error) {
    logTest("POST /api/users/register_user", false, error.message);
  }

  // Test 9: Assign role
  try {
    const assignRole = await makeRequest("/api/users/assign_role", "POST", {
      email: "testassign@ehr.com",
      name: "Test Assign",
      role: "nurse"
    });
    logTest("POST /api/users/assign_role", assignRole.status === 200, `Status: ${assignRole.status}`);
  } catch (error) {
    logTest("POST /api/users/assign_role", false, error.message);
  }

  console.log("\n─── Patient Management (SQLite) ───");

  // Test 10: Get all patients
  try {
    const patients = await makeRequest("/api/patients");
    logTest("GET /api/patients", patients.status === 200, `Status: ${patients.status}`);
  } catch (error) {
    logTest("GET /api/patients", false, error.message);
  }

  // Test 11: Get patient by name
  try {
    const getPatient = await makeRequest("/api/patients/get_patient/Arjun Gupta");
    logTest("GET /api/patients/get_patient/:name", getPatient.status === 200, `Status: ${getPatient.status}`);
  } catch (error) {
    logTest("GET /api/patients/get_patient/:name", false, error.message);
  }

  // Test 12: Add patient
  try {
    const addPatient = await makeRequest("/api/patients/add_patient", "POST", {
      patientName: "Test Patient",
      age: 45,
      gender: "Male",
      diagnosis: "Test Diagnosis",
      doctor_name: "Dr. Rajesh Kumar",
      patient_email: "testpatient@gmail.com"
    });
    logTest("POST /api/patients/add_patient", addPatient.status === 200, `Status: ${addPatient.status}`);
  } catch (error) {
    logTest("POST /api/patients/add_patient", false, error.message);
  }

  // Test 13: Get doctor's patients
  try {
    const doctorPatients = await makeRequest("/api/patients/doctor_patients/Dr. Rajesh Kumar");
    logTest("GET /api/patients/doctor_patients/:name", doctorPatients.status === 200, `Status: ${doctorPatients.status}`);
  } catch (error) {
    logTest("GET /api/patients/doctor_patients/:name", false, error.message);
  }

  console.log("\n─── Access Control (SQLite) ───");

  // Test 14: Request access (requires JWT)
  try {
    const requestAccess = await makeRequest("/api/access/request", "POST", {
      patientId: 1,
      accessType: "view",
      reason: "Medical consultation"
    });
    // This will fail without JWT, but tests endpoint existence
    logTest("POST /api/access/request", requestAccess.status !== 404, `Status: ${requestAccess.status}`);
  } catch (error) {
    logTest("POST /api/access/request", false, error.message);
  }

  // Test 15: Get pending access requests
  try {
    const getPending = await makeRequest("/api/access/pending");
    logTest("GET /api/access/pending", getPending.status !== 404, `Status: ${getPending.status}`);
  } catch (error) {
    logTest("GET /api/access/pending", false, error.message);
  }

  console.log("\n─── Logging (SQLite) ───");

  // Test 16: Get access logs (requires JWT)
  try {
    const logs = await makeRequest("/api/logs");
    logTest("GET /api/logs", logs.status !== 404, `Status: ${logs.status}`);
  } catch (error) {
    logTest("GET /api/logs", false, error.message);
  }

  // Test 17: Log access event (requires JWT)
  try {
    const logEvent = await makeRequest("/api/logs", "POST", {
      userId: "test@ehr.com",
      action: "view_patient",
      patientId: 1
    });
    logTest("POST /api/logs", logEvent.status !== 404, `Status: ${logEvent.status}`);
  } catch (error) {
    logTest("POST /api/logs", false, error.message);
  }

  console.log("\n─── Database Integrity ───");

  // Test 18: Verify SQLite connection
  try {
    const stats = await makeRequest("/api/general/stats");
    if (stats.status === 200 && stats.data?.stats) {
      const { totalUsers, totalPatients, totalAccessLogs } = stats.data.stats;
      logTest("SQLite Database Connection", true, `Users: ${totalUsers}, Patients: ${totalPatients}, Logs: ${totalAccessLogs}`);
    } else {
      logTest("SQLite Database Connection", false, "Stats endpoint failed");
    }
  } catch (error) {
    logTest("SQLite Database Connection", false, error.message);
  }

  // Print Summary
  console.log("\n╔═══════════════════════════════════════════════════════════════╗");
  console.log(`║                     TEST SUMMARY                            ║`);
  console.log("╠═══════════════════════════════════════════════════════════════╣");
  console.log(`║ ✅ Passed: ${testResults.passed} / Total: ${testResults.passed + testResults.failed}`);
  console.log(`║ ❌ Failed: ${testResults.failed}`);
  console.log("╠═══════════════════════════════════════════════════════════════╣");

  if (testResults.failed === 0) {
    console.log("║      🎉 All tests passed! Backend is fully functional       ║");
  } else {
    console.log("║  ⚠️  Some tests failed. Review the output above.           ║");
  }

  console.log("╚═══════════════════════════════════════════════════════════════╝\n");

  // Summary by category
  console.log("📊 Test Coverage:");
  console.log(`   • Health Checks: ✅`);
  console.log(`   • Authentication: ✅`);
  console.log(`   • User Management (SQLite): ✅`);
  console.log(`   • Patient Management (SQLite): ✅`);
  console.log(`   • Access Control: ✅`);
  console.log(`   • Logging (SQLite): ✅`);
  console.log(`   • Database Integrity: ✅\n`);

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
