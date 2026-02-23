#!/usr/bin/env python
# test_token_flow.py - Complete token flow test

import sys
from static_db import verify_user_credentials
from token_manager import create_admin_token, verify_token

print('='*60)
print('🧪 COMPLETE TOKEN FLOW TEST')
print('='*60)

# Step 1: Verify credentials
print('\n1️⃣ Verifying admin credentials...')
user = verify_user_credentials('admin@ehr.com', 'Admin@123')
if user:
    name = user.get('name')
    print(f'   ✅ Admin verified: {name}')
else:
    print('   ❌ Failed')
    sys.exit(1)

# Step 2: Create token
print('\n2️⃣ Creating session token...')
uid = user.get('id')
email = user.get('email')
token = create_admin_token(uid, email)
preview = token[:40]
print(f'   ✅ Token created: {preview}...')

# Step 3: Verify token
print('\n3️⃣ Verifying token...')
session = verify_token(token)
if session:
    s_email = session.get('email')
    print(f'   ✅ Token verified for: {s_email}')
else:
    print('   ❌ Token verification failed')
    sys.exit(1)

# Step 4: Test formatting
print('\n4️⃣ Token formatting test...')
bearer = f'Bearer {token}'
extracted = bearer.split('Bearer ')[1]
bearer_preview = bearer[:50]
extracted_preview = extracted[:50]
print(f'   Bearer format: {bearer_preview}...')
print(f'   Extracted: {extracted_preview}...')
types_match = type(token) == type(extracted)
print(f'   Types match: {types_match}')

print('\n' + '='*60)
print('✅ ALL TESTS PASSED!')
print('='*60)
