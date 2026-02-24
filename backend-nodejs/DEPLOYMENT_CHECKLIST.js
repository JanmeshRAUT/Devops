#!/usr/bin/env node

/**
 * DEPLOYMENT CHECKLIST - SQLite Backend
 * 
 * Use this checklist to verify your backend is ready for production deployment
 * Run this file: node DEPLOYMENT_CHECKLIST.md
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                DEPLOYMENT CHECKLIST                         ║');
console.log('║         SQLite Backend - Production Ready Check             ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let checksPassed = 0;
let checksFailed = 0;

function check(name, condition, details = '') {
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${name}`);
  if (details && !condition) console.log(`       ${details}`);
  
  if (condition) {
    checksPassed++;
  } else {
    checksFailed++;
  }
}

async function runChecks() {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. FILE EXISTENCE CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('📋 1. FILE EXISTENCE CHECKS\n');
  
  const requiredFiles = [
    'app.js',
    'start.js',
    'database.js',
    'config.js',
    'middleware.js',
    'utils.js',
    'package.json',
    '.env'
  ];
  
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    check(`File exists: ${file}`, exists, `Missing: ${file}`);
  }
  
  const requiredDirs = [
    'routes',
    'node_modules'
  ];
  
  for (const dir of requiredDirs) {
    const exists = fs.existsSync(path.join(__dirname, dir));
    check(`Directory exists: ${dir}`, exists, `Missing: ${dir}`);
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // 2. CONFIGURATION CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('\n📋 2. CONFIGURATION CHECKS\n');
  
  const envExists = fs.existsSync(path.join(__dirname, '.env'));
  check('.env file exists', envExists, 'Create .env from .env.example');
  
  if (envExists) {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const envVars = {
      'PORT': /PORT=/,
      'NODE_ENV': /NODE_ENV=/,
      'JWT_SECRET': /JWT_SECRET=/,
      'ADMIN_EMAIL': /ADMIN_EMAIL=/,
      'DATABASE_PATH': /DATABASE_PATH=/
    };
    
    for (const [key, pattern] of Object.entries(envVars)) {
      check(`Environment variable set: ${key}`, pattern.test(envContent), `Missing: ${key}`);
    }
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // 3. PACKAGE & DEPENDENCY CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('\n📋 3. PACKAGE & DEPENDENCY CHECKS\n');
  
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
  );
  
  const requiredDeps = [
    'express',
    'sqlite3',
    'jsonwebtoken',
    'cors',
    'dotenv',
    'bcryptjs',
    'nodemailer'
  ];
  
  for (const dep of requiredDeps) {
    check(
      `Dependency installed: ${dep}`,
      dep in packageJson.dependencies,
      `Missing: ${dep}`
    );
  }
  
  const forbiddenDeps = ['firebase-admin'];
  for (const dep of forbiddenDeps) {
    check(
      `Firebase removed: ${dep}`,
      !(dep in packageJson.dependencies),
      `ERROR: ${dep} still in dependencies!`
    );
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // 4. DATABASE CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('\n📋 4. DATABASE CHECKS\n');
  
  const dbPathEnv = process.env.DATABASE_PATH || './ehr.db';
  const dbPath = path.join(__dirname, dbPathEnv.replace('./', ''));
  const dbExists = fs.existsSync(dbPath);
  check('SQLite database exists', dbExists, 'Run: node setup-sqlite-backend.js');
  
  if (dbExists) {
    try {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(dbPath);
      
      const tables = await new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(r => r.name));
        });
      });
      
      const requiredTables = [
        'users', 'patients', 'access_requests', 
        'emergency_access', 'access_logs', 'otp_sessions'
      ];
      
      for (const table of requiredTables) {
        check(
          `Database table exists: ${table}`,
          tables.includes(table),
          `Missing table: ${table}`
        );
      }
      
      db.close();
    } catch (error) {
      check('Database readable', false, error.message);
    }
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // 5. CODE QUALITY CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('\n📋 5. CODE QUALITY CHECKS\n');
  
  const firebaseRefs = [
    'firebase-admin',
    'firebaseApp',
    'admin.firestore',
    'admin.auth'
  ];
  
  const filesToCheck = [
    'app.js',
    'start.js',
    'database.js',
    'config.js'
  ];
  
  for (const file of filesToCheck) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    let hasFirebase = false;
    
    for (const ref of firebaseRefs) {
      if (content.includes(ref)) {
        hasFirebase = true;
        break;
      }
    }
    
    check(
      `No Firebase references in: ${file}`,
      !hasFirebase,
      `Firebase code found in ${file}`
    );
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // 6. SECURITY CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('\n📋 6. SECURITY CHECKS\n');
  
  if (envExists) {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    
    check(
      'JWT_SECRET is set',
      /JWT_SECRET=.+/.test(envContent),
      'Set JWT_SECRET in .env'
    );
    
    check(
      'ADMIN_PASSWORD is set',
      /ADMIN_PASSWORD=.+/.test(envContent),
      'Set ADMIN_PASSWORD in .env'
    );
    
    // Check if using default values
    const isDefaultSecret = envContent.includes('JWT_SECRET=your-secret');
    check(
      'JWT_SECRET is not default value',
      !isDefaultSecret,
      'Change from default secret key'
    );
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // 7. SERVER CONNECTIVITY CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('\n📋 7. SERVER CONNECTIVITY CHECKS (Optional)\n');
  console.log('  Note: These checks require server to be running on port 5000');
  console.log('  Skipping if server is not available...\n');
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5000/health', { timeout: 2000 }, (res) => {
        resolve(res);
      });
      req.on('error', reject);
    });
    
    check('Server is running', response.statusCode === 200, `Status: ${response.statusCode}`);
  } catch (error) {
    console.log('  ⚠️  Skipped - Server not running (OK for pre-deployment check)');
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // 8. DOCUMENTATION CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('\n📋 8. DOCUMENTATION CHECKS\n');
  
  const docs = [
    'QUICKSTART.md',
    'SQLITE_MIGRATION_GUIDE.md',
    'RESTRUCTURING_SUMMARY.md'
  ];
  
  for (const doc of docs) {
    const exists = fs.existsSync(path.join(__dirname, doc));
    check(`Documentation available: ${doc}`, exists, `Missing: ${doc}`);
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // 9. GIT CHECKS
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('\n📋 9. GIT & VERSION CONTROL CHECKS\n');
  
  const gitIgnorePath = path.join(__dirname, '..', '..', '.gitignore');
  if (fs.existsSync(gitIgnorePath)) {
    const gitIgnore = fs.readFileSync(gitIgnorePath, 'utf8');
    check(
      '.env is in .gitignore',
      gitIgnore.includes('.env'),
      'Add .env to .gitignore'
    );
    
    check(
      'node_modules in .gitignore',
      gitIgnore.includes('node_modules'),
      'Add node_modules to .gitignore'
    );
    
    check(
      '*.db in .gitignore',
      gitIgnore.includes('*.db'),
      'Add *.db to .gitignore'
    );
  }
  
  // ──────────────────────────────────────────────────────────────────────────
  // RESULTS SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     RESULTS SUMMARY                          ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║ ✅ Passed: ${checksPassed}`.padEnd(61) + '║');
  console.log(`║ ❌ Failed: ${checksFailed}`.padEnd(61) + '║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  
  if (checksFailed === 0) {
    console.log('║                                                              ║');
    console.log('║  🎉 ALL CHECKS PASSED! Backend is ready for deployment!   ║');
    console.log('║                                                              ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║ Next steps:                                                  ║');
    console.log('║  1. npm install                                              ║');
    console.log('║  2. node setup-sqlite-backend.js                             ║');
    console.log('║  3. npm start (or npm run dev)                               ║');
    console.log('║  4. node comprehensive-backend-test.js                       ║');
    console.log('║  5. Deploy to production!                                    ║');
    console.log('║                                                              ║');
  } else {
    console.log('║                                                              ║');
    console.log('║  ⚠️  SOME CHECKS FAILED!                                    ║');
    console.log('║  Fix the issues above before deploying.                     ║');
    console.log('║                                                              ║');
  }
  
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  process.exit(checksFailed > 0 ? 1 : 0);
}

// Run checks
runChecks().catch(error => {
  console.error('Fatal error during checks:', error.message);
  process.exit(1);
});
