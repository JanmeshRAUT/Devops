
from datetime import datetime
from static_db import STATIC_USERS, add_access_log

def get_trust_score(name):
    """Get trust score for a user by name from static database"""
    for user in STATIC_USERS.values():
        if user.get("name", "").lower() == name.lower():
            return user.get("trust_score", 80)
    return 80

def update_trust_score(name, delta):
    """Update trust score for a user by name in static database"""
    for user in STATIC_USERS.values():
        if user.get("name", "").lower() == name.lower():
            current = user.get("trust_score", 80)
            new_score = max(0, min(100, current + delta))
            user["trust_score"] = new_score
            user["last_update"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            print(f"🔁 Trust score updated: {name} {current} -> {new_score}")
            return new_score
    return None

def safe_log_access(log_data):
    """
    Log access to static database access logs.
    """
    try:
        add_access_log(log_data)
        print(f"📝 Access logged: {log_data.get('action')}")
    except Exception as e:
        print(f"⚠️ Logging failed (non-fatal): {e}")
