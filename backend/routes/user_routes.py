
from flask import Blueprint, request, jsonify
from datetime import datetime
import traceback
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from limiter import limiter
from middleware import verify_admin_token
from helpers import patient_doc_id

user_bp = Blueprint('user_routes', __name__)

# ---------- Load static users database ----------
STATIC_USERS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static_users.json")

def load_static_users():
    try:
        with open(STATIC_USERS_FILE, 'r') as f:
            data = json.load(f)
            return data.get("users", [])
    except Exception as e:
        print(f"❌ Error loading static users: {e}")
        return []

@user_bp.route("/get_all_users", methods=["GET"])
@verify_admin_token
def get_all_users():
    try:
        print("📤 GET /get_all_users - fetching from static database...")
        users = load_static_users()
        users_sorted = sorted(users, key=lambda x: x.get("name", "").lower())
        return jsonify({"success": True, "users": users_sorted, "count": len(users_sorted)}), 200
    except Exception as e:
        print("❌ Error fetching users:", e)
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@user_bp.route("/register_user", methods=["POST"])
@limiter.limit("10 per hour")  # ✅ Prevent spam registration
def register_user():
    """
    Admin adds new users (Doctor, Nurse, Patient, etc.) to static database
    """
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        role = data.get("role")
        password = data.get("password", "DefaultPass@123")
        age = data.get("age", 0)
        gender = data.get("gender", "")

        if not all([name, email, role]):
            return jsonify({"success": False, "message": "❌ Missing required fields."}), 400

        name_clean = name.strip()
        role_clean = role.strip().lower()
        email_clean = email.strip().lower()
        
        # Load existing users
        users = load_static_users()
        
        # Check if user already exists
        if any(u.get("email") == email_clean for u in users):
            return jsonify({"success": False, "message": "⚠️ User already registered."}), 409

        # Generate new user ID
        new_id = max([u.get("id", 0) for u in users], default=0) + 1
        
        new_user = {
            "id": new_id,
            "name": name_clean,
            "email": email_clean,
            "password": password,
            "role": role_clean,
            "age": int(age) if age else 0,
            "gender": gender if gender else "",
            "trust_score": 80,
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        users.append(new_user)
        
        # Save updated users to static file
        try:
            with open(STATIC_USERS_FILE, 'w') as f:
                json.dump({"users": users}, f, indent=2)
            print(f"👤 User registered: {name_clean} ({role_clean}) - ID: {new_id}")
            return jsonify({"success": True, "message": f"Registered {name_clean} ({role_clean}) successfully."}), 200
        except Exception as e:
            print(f"❌ Error saving user to file: {e}")
            return jsonify({"success": False, "message": "Error saving user"}), 500

    except Exception as e:
        print("❌ Error registering user:", e)
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

@user_bp.route("/delete_user/<user_email>", methods=["DELETE"])
@verify_admin_token
@limiter.limit("10 per hour")  # ✅ Prevent accidental bulk user deletions
def delete_user(user_email):
    """Delete a user from the static database"""
    try:
        users = load_static_users()
        user_email_clean = user_email.strip().lower()
        
        # Find and remove user
        user_found = None
        users_filtered = []
        for u in users:
            if u.get("email") == user_email_clean:
                user_found = u
            else:
                users_filtered.append(u)
        
        if not user_found:
            return jsonify({"success": False, "error": "❌ User not found"}), 404
        
        # Save updated users list
        try:
            with open(STATIC_USERS_FILE, 'w') as f:
                json.dump({"users": users_filtered}, f, indent=2)
            print(f"User {user_found.get('name')} ({user_email_clean}) deleted successfully")
            return jsonify({"success": True, "message": f"User {user_found.get('name')} deleted successfully"}), 200
        except Exception as e:
            print(f"❌ Error saving user list: {e}")
            return jsonify({"success": False, "error": "Error deleting user"}), 500
    
    except Exception as e:
        print(f"❌ Error deleting user: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

        print(f"❌ delete_user error: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500
