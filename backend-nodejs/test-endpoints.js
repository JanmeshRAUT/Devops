// test-endpoints.js - Test all migrated endpoints
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
            success: res.statusCode === 200,
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
  console.log('🧪 Testing Backend Endpoints\n');

  const tests = [
    // Health
    { path: '/health', method: 'GET', name: 'Health Check' },
    
    // General routes
    { path: '/get_all_users', method: 'GET', name: 'Get All Users' },
    { path: '/all_patients', method: 'GET', name: 'Get All Patients' },
    { path: '/stats', method: 'GET', name: 'Get Statistics' },
    { path: '/access_logs/admin', method: 'GET', name: 'Get Admin Access Logs' },
    { path: '/all_doctor_access_logs', method: 'GET', name: 'Get Doctor Access Logs' },
    { path: '/all_nurse_access_logs', method: 'GET', name: 'Get Nurse Access Logs' },
    { path: '/ip_check', method: 'GET', name: 'IP Check' },
    
    // Auth routes
    { path: '/auth/admin/login', method: 'POST', body: { email: 'admin@ehr.com', password: 'pass123' }, name: 'Admin Login' },
    { path: '/api/auth/admin/login', method: 'POST', body: { email: 'admin@ehr.com', password: 'pass123' }, name: 'Admin Login (API path)' },
    
    // Access routes
    { path: '/access_logs/admin', method: 'GET', name: 'Access Logs Admin' },
  ];

  for (const test of tests) {
    try {
      const result = await makeRequest(test.path, test.method, test.body);
      const statusEmoji = result.success ? '✅' : '❌';
      console.log(`${statusEmoji} ${test.name}`);
      console.log(`   Path: ${test.method} ${test.path}`);
      console.log(`   Status: ${result.status}`);
      if (result.data) {
        console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}`);
      }
      console.log();
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  console.log('✅ Testing completed!');
}

testEndpoints().catch(console.error);
