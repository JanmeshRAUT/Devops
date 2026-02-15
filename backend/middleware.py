
from functools import wraps
from flask import request, jsonify
import json
import os
from utils import ADMIN_EMAIL

# ---------- Load static users database ----------
STATIC_USERS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static_users.json")

def load_static_users():
    try:
        with open(STATIC_USERS_FILE, 'r') as f:
            data = json.load(f)
            return data.get("users", [])
    except Exception as e:
        print(f"❌ Error loading static users: {e}")
        return []

def is_valid_admin(user_id):
    """Check if user_id belongs to an admin"""
    try:
        users = load_static_users()
        for user in users:
            if str(user.get("id")) == str(user_id) and user.get("role") == "admin":
                return True
    except Exception as e:
        print(f"❌ Error validating admin: {e}")
    return False

# ---------- Authorization Decorator ----------
def verify_admin_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            print("🚫 Missing Authorization header")
            return jsonify({"success": False, "error": "Missing token"}), 401
        try:
            if token.startswith("Bearer "):
                token = token.split("Bearer ")[1]
            
            # ✅ Verify against static database (user_id format)
            if is_valid_admin(token):
                return f(*args, **kwargs)
            else:
                print(f"🚫 Unauthorized access attempt with token: {token}")
                return jsonify({"success": False, "error": "Unauthorized - Admin access required"}), 403
        except Exception as e:
            print(f"❌ Token verification failed: {e}")
            return jsonify({"success": False, "error": "Invalid or expired token"}), 401
    return decorated_function
