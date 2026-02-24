#!/usr/bin/env node
// comprehensive-backend-test.js - Full endpoint validation

const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            path,
            method,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            path,
            method,
            success: false,
            data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testEndpoints() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   BACKEND ENDPOINT COMPREHENSIVE TEST REPORT      ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const categories = {
    'Health & System': [
      { path: '/health', method: 'GET', name: 'Health Check' },
      { path: '/system-info', method: 'GET', name: 'System Information' },
      { path: '/ip_check', method: 'GET', name: 'IP Check' },
    ],
    'Statistics & Data': [
      { path: '/stats', method: 'GET', name: 'Get Statistics' },
      { path: '/get_all_users', method: 'GET', name: 'Get All Users' },
      { path: '/all_patients', method: 'GET', name: 'Get All Patients' },
    ],
    'Access Management': [
      { path: '/access_logs/admin', method: 'GET', name: 'Admin Access Logs' },
      { path: '/all_doctor_access_logs', method: 'GET', name: 'Doctor Access Logs' },
      { path: '/all_nurse_access_logs', method: 'GET', name: 'Nurse Access Logs' },
    ],
    'Authentication': [
      { path: '/auth/admin/login', method: 'POST', body: { email: 'admin@ehr.com', password: 'pass123' }, name: 'Admin Login' },
      { path: '/api/auth/admin/login', method: 'POST', body: { email: 'admin@ehr.com', password: 'pass123' }, name: 'Admin Login (API)' },
    ]
  };

  let totalTests = 0;
  let passedTests = 0;
  const results = [];

  for (const [category, tests] of Object.entries(categories)) {
    console.log(`\n📋 ${category}`);
    console.log('═'.repeat(50));

    for (const test of tests) {
      try {
        const result = await makeRequest(test.path, test.method, test.body);
        totalTests++;
        
        if (result.success) {
          passedTests++;
          console.log(`  ✅ ${test.name}`);
          console.log(`     ${test.method} ${test.path} → ${result.status}`);
          results.push({ name: test.name, status: 'PASS', code: result.status });
        } else {
          console.log(`  ⚠️  ${test.name}`);
          console.log(`     ${test.method} ${test.path} → ${result.status}`);
          if (result.data?.error) console.log(`     Error: ${result.data.error}`);
          results.push({ name: test.name, status: 'FAIL', code: result.status });
        }
      } catch (error) {
        totalTests++;
        console.log(`  ❌ ${test.name}`);
        console.log(`     Error: ${error.message}`);
        results.push({ name: test.name, status: 'ERROR', code: null });
      }
    }
  }

  // Summary
  console.log('\n\n╔══════════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY REPORT                  ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║ Total Tests:    ${totalTests}${' '.repeat(40 - totalTests.toString().length)}║`);
  console.log(`║ Passed:         ${passedTests}${' '.repeat(40 - passedTests.toString().length)}║`);
  console.log(`║ Failed:         ${totalTests - passedTests}${' '.repeat(40 - (totalTests - passedTests).toString().length)}║`);
  console.log(`║ Success Rate:   ${Math.round((passedTests / totalTests) * 100)}%${' '.repeat(38 - Math.round((passedTests / totalTests) * 100).toString().length)}║`);
  console.log('╠══════════════════════════════════════════════════╣');
  
  if (passedTests === totalTests) {
    console.log('║  ✅ ALL TESTS PASSED - BACKEND IS HEALTHY!       ║');
  } else {
    console.log(`║  ⚠️  ${totalTests - passedTests} TEST(S) FAILED - CHECK ABOVE        ║`);
  }
  
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Database info
  console.log('📊 Database Status:');
  console.log('═'.repeat(50));
  
  try {
    const dbInfo = await makeRequest('/stats', 'GET');
    if (dbInfo.data?.stats) {
      const { totalUsers, totalPatients, totalAccessLogs, totalAccessRequests } = dbInfo.data.stats;
      console.log(`  Users:           ${totalUsers}`);
      console.log(`  Patients:        ${totalPatients}`);
      console.log(`  Access Logs:     ${totalAccessLogs}`);
      console.log(`  Access Requests: ${totalAccessRequests}`);
    }
  } catch (e) {
    console.log('  Error retrieving database stats');
  }

  console.log('\n✅ Testing completed!\n');
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

testEndpoints().catch(console.error);
