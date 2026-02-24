#!/usr/bin/env node
/**
 * Frontend-Backend Connection Test
 * Tests if the React frontend can communicate with the Node.js backend
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║  FRONTEND-BACKEND CONNECTION TEST                  ║');
console.log('╚════════════════════════════════════════════════════╝\n');

// Test 1: Check Backend Configuration
console.log('📋 Test 1: Configuration Files\n');

try {
  // Check backend config
  const backendConfig = require('./config.js');
  console.log('✅ Backend config.js exists');
  console.log(`   - Admin Email: ${backendConfig.ADMIN_EMAIL}`);
  console.log(`   - Port: ${backendConfig.PORT}`);
  console.log(`   - Database: ${backendConfig.DATABASE_PATH}`);
  console.log(`   - Environment: ${backendConfig.NODE_ENV}\n`);
} catch (e) {
  console.log('❌ Backend config.js error:', e.message, '\n');
}

// Test 2: Check Frontend API Configuration
console.log('📋 Test 2: Frontend API Configuration\n');

try {
  const apiPath = path.join(__dirname, '../frontend/src/api.js');
  if (fs.existsSync(apiPath)) {
    const apiContent = fs.readFileSync(apiPath, 'utf8');
    if (apiContent.includes('localhost:5000')) {
      console.log('✅ Frontend is configured to use http://localhost:5000');
      console.log('   - Development API endpoint: http://localhost:5000\n');
    } else {
      console.log('⚠️  Frontend API configuration may need updating\n');
    }
  }
} catch (e) {
  console.log('❌ Error checking frontend config:', e.message, '\n');
}

// Test 3: Test Backend Availability
console.log('📋 Test 3: Backend Health Check\n');

function testBackendConnection() {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: response
          });
        } catch (e) {
          resolve({
            success: false,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        success: false,
        error: e.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Connection timeout'
      });
    });

    req.end();
  });
}

// Test 4: API Endpoint Tests
async function testEndpoints() {
  console.log('📋 Test 4: API Endpoint Availability\n');

  const endpoints = [
    { method: 'GET', path: '/health', name: 'Health Check' },
    { method: 'GET', path: '/stats', name: 'Statistics' },
    { method: 'GET', path: '/get_all_users', name: 'Get Users' },
    { method: 'GET', path: '/all_patients', name: 'Get Patients' },
  ];

  for (const endpoint of endpoints) {
    const result = await testApiEndpoint(endpoint);
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${endpoint.name}`);
    if (result.status) console.log(`   Status: ${result.status}`);
    if (result.error) console.log(`   Error: ${result.error}`);
  }
}

function testApiEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          status: res.statusCode
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        success: false,
        error: e.message
      });
    });

    req.end();
  });
}

// Main test execution
async function runTests() {
  const backendStatus = await testBackendConnection();

  if (backendStatus.success) {
    console.log(`✅ Backend is running on http://localhost:5000`);
    console.log(`   Status: ${backendStatus.data.status}`);
    console.log(`   Database: ${backendStatus.data.database}\n`);
    
    await testEndpoints();
  } else {
    console.log(`❌ Backend is not responding`);
    console.log(`   Error: ${backendStatus.error}`);
    console.log(`   Make sure to start backend with: cd backend-nodejs && node app.js\n`);
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║               CONNECTION SUMMARY                   ║');
  console.log('╠════════════════════════════════════════════════════╣');
  
  if (backendStatus.success) {
    console.log('║ ✅ Backend:  http://localhost:5000 - RUNNING      ║');
    console.log('║ ⏳ Frontend: http://localhost:3000 - NOT TESTED    ║');
    console.log('║                                                    ║');
    console.log('║ To start frontend:                                 ║');
    console.log('║   cd frontend                                      ║');
    console.log('║   npm start                                        ║');
  } else {
    console.log('║ ❌ Backend:  http://localhost:5000 - NOT RUNNING  ║');
    console.log('║                                                    ║');
    console.log('║ To start backend:                                  ║');
    console.log('║   cd backend-nodejs                                ║');
    console.log('║   node app.js                                      ║');
  }
  
  console.log('╚════════════════════════════════════════════════════╝\n');
}

runTests().catch(console.error);
