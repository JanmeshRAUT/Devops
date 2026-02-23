#!/usr/bin/env python
# test_admin_login.py - Test admin login credentials

from static_db import ADMINS, verify_user_credentials

print('=' * 60)
print('👨‍💻 ADMIN ACCOUNTS IN DATABASE:')
print('=' * 60)
for email, user in ADMINS.items():
    print(f'  Email: {email}')
    password = user.get("password")
    print(f'  Password: {password}')
    role = user.get("role")
    print(f'  Role: {role}')
    print()

print('=' * 60)
print('🧪 TEST LOGIN:')
print('=' * 60)
result = verify_user_credentials('admin@ehr.com', 'Admin@123')
if result:
    name = result.get("name")
    print(f'✅ Login successful: {name}')
    print(f'   ID: {result.get("id")}')
else:
    print('❌ Login failed - credentials not found')

print()
print('🧪 TEST LOGIN WITH WRONG PASSWORD:')
result2 = verify_user_credentials('admin@ehr.com', 'WrongPassword')
if result2:
    print('❌ ERROR - Login should have failed!')
else:
    print('✅ Correctly rejected wrong password')
