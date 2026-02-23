#!/usr/bin/env python
# test_api_login.py - Test the Flask API login endpoint

import requests
import json
import sys
import time

BASE_URL = "http://localhost:5000"

print('=' * 60)
print('🧪 TESTING ADMIN LOGIN API')
print('=' * 60)

# Test 1: Admin Login
print('\n1️⃣ Testing POST /admin/login')
admin_data = {
    "email": "admin@ehr.com",
    "password": "Admin@123"
}

try:
    response = requests.post(f'{BASE_URL}/admin/login', json=admin_data, timeout=5)
    print(f'   Status: {response.status_code}')
    print(f'   Response: {json.dumps(response.json(), indent=2)}')
    
    if response.status_code == 200:
        print('   ✅ ADMIN LOGIN SUCCESS')
    else:
        print('   ❌ ADMIN LOGIN FAILED')
        
except requests.exceptions.ConnectionError:
    print('   ❌ ERROR: Cannot connect to Flask (is it running on port 5000?)')
    print('   💡 Run: cd backend && python app.py')
    sys.exit(1)
except Exception as e:
    print(f'   ❌ ERROR: {e}')

# Test 2: Invalid Password
print('\n2️⃣ Testing POST /admin/login with wrong password')
invalid_data = {
    "email": "admin@ehr.com",
    "password": "WrongPassword"
}

try:
    response = requests.post(f'{BASE_URL}/admin/login', json=invalid_data, timeout=5)
    print(f'   Status: {response.status_code}')
    print(f'   Response: {json.dumps(response.json(), indent=2)}')
    
    if response.status_code == 401:
        print('   ✅ CORRECTLY REJECTED INVALID PASSWORD')
    else:
        print('   ❌ ERROR: Should have rejected invalid password')
        
except Exception as e:
    print(f'   ❌ ERROR: {e}')

# Test 3: Missing email
print('\n3️⃣ Testing POST /admin/login with missing email')
missing_email = {
    "password": "Admin@123"
}

try:
    response = requests.post(f'{BASE_URL}/admin/login', json=missing_email, timeout=5)
    print(f'   Status: {response.status_code}')
    print(f'   Response: {json.dumps(response.json(), indent=2)}')
    
    if response.status_code == 400:
        print('   ✅ CORRECTLY REJECTED MISSING EMAIL')
    else:
        print('   ❌ ERROR: Should have rejected missing email')
        
except Exception as e:
    print(f'   ❌ ERROR: {e}')

print('\n' + '=' * 60)
print('If tests failed, make sure Flask is running:')
print('  cd backend')
print('  python app.py')
print('=' * 60)
