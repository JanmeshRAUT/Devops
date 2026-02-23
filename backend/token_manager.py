# token_manager.py - Centralized token management for sessions

import uuid
from datetime import datetime, timedelta

# ============================================
# ACTIVE SESSIONS STORAGE
# ============================================
ACTIVE_SESSIONS = {}

# Token expiration: 24 hours
TOKEN_EXPIRY_HOURS = 24

# ============================================
# TOKEN FUNCTIONS
# ============================================

def create_admin_token(user_id, email):
    """Create a new admin session token"""
    token = f"admin_{user_id}_{uuid.uuid4().hex[:16]}"
    expiry = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)
    
    ACTIVE_SESSIONS[token] = {
        "email": email,
        "user_id": user_id,
        "created": datetime.utcnow().isoformat(),
        "expires": expiry.isoformat()
    }
    
    print(f"✅ Token created: {token[:20]}... for {email}")
    return token

def verify_token(token):
    """Verify if token is valid and not expired"""
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
    """Revoke a token"""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
        print(f"✅ Token revoked: {token[:20]}...")
        return True
    return False

def get_session_count():
    """Get count of active sessions"""
    return len(ACTIVE_SESSIONS)

def print_active_sessions():
    """Print all active sessions (for debugging)"""
    print("\n📋 ACTIVE SESSIONS:")
    for token, session in ACTIVE_SESSIONS.items():
        print(f"  {token[:30]}... | {session['email']} | Expires: {session['expires']}")
    print()

# ============================================
# DEBUG
# ============================================
if __name__ == "__main__":
    # Test token creation  
    token1 = create_admin_token("admin_001", "admin@ehr.com")
    print_active_sessions()
    
    # Test token verification
    session = verify_token(token1)
    print(f"Session: {session}\n")
    
    # Test invalid token
    verify_token("invalid_token")
