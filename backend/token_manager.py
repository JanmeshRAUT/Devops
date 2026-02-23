

import uuid
from datetime import datetime, timedelta

ACTIVE_SESSIONS = {}

TOKEN_EXPIRY_HOURS = 24

def create_admin_token(user_id, email):
    if not token or not isinstance(token, str):
        print(f"🚫 Invalid token format: {type(token)}")
        return None

    if token not in ACTIVE_SESSIONS:
        print(f"🚫 Token not found: {token[:20] if len(token) > 20 else token}...")
        return None

    session = ACTIVE_SESSIONS[token]
    expiry = datetime.fromisoformat(session["expires"])

    if datetime.utcnow() > expiry:
        print(f"🚫 Token expired: {token[:20]}...")
        del ACTIVE_SESSIONS[token]
        return None

    print(f"✅ Token valid: {token[:20] if len(token) > 20 else token}... for {session['email']}")
    return session

def revoke_token(token):
    return len(ACTIVE_SESSIONS)

def print_active_sessions():