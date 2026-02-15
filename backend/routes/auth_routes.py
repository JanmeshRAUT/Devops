
from flask import Blueprint, request, jsonify
import random
import string
import time
import traceback
import sys
import os
import json

# Adjust path to import from parent directory if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from limiter import limiter
from utils import send_otp_email, ADMIN_EMAIL

auth_bp = Blueprint('auth_routes', __name__)

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

# ---------- In-memory OTP sessions ----------
otp_sessions = {}


@auth_bp.route("/admin/login", methods=["POST"])
def admin_login():
    """Admin login with static database"""
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    try:
        users = load_static_users()
        
        # Find user with matching email and password and admin role
        for user in users:
            if user.get("email") == email and user.get("password") == password and user.get("role") == "admin":
                print(f"✅ Admin verified: {email}")
                return jsonify({"success": True, "message": "Admin verified ✅", "user_id": user.get("id")})
        
        print(f"🚫 Unauthorized admin attempt: {email}")
        return jsonify({"success": False, "error": "Invalid admin credentials"}), 403
        
    except Exception as e:
        print("❌ Admin login error:", e)
        return jsonify({"error": "Server error"}), 500

@auth_bp.route("/user_login", methods=["POST"])
@limiter.limit("5 per minute")  # ✅ Prevent brute force
def user_login():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    role = data.get("role", "").strip().lower()
    
    # ✅ Validate required fields
    if not name or not role or not email or not password:
        return jsonify(success=False, error="Name, email, password, and role are required"), 400
    
    # ✅ Validate email format
    if "@" not in email:
        return jsonify(success=False, error="Invalid email format"), 400
    
    try:
        users = load_static_users()
        
        # Find user in static database
        user_found = False
        for user in users:
            if (user.get("name") == name and 
                user.get("email") == email and 
                user.get("password") == password and
                user.get("role") == role):
                user_found = True
                break
        
        if not user_found:
            return jsonify(success=False, error=f"Invalid credentials for {role}"), 401
        
        # Generate OTP and create session
        otp = "".join(random.choices(string.digits, k=6))
        session_id = f"{name}_{int(time.time())}"
        otp_sessions[session_id] = {
            "otp": otp,
            "expires": time.time() + 180,
            "email": email,
            "name": name,
            "role": role,
            "user_id": user.get("id")
        }
        
        # ✅ Send OTP to email
        if send_otp_email(email, otp, name):
            print(f"✅ OTP sent to {email} for {name} ({role})")
            return jsonify(success=True, session_id=session_id, message="✅ OTP sent to your email"), 200
        else:
            return jsonify(success=False, error="Failed to send OTP. Please try again."), 500
            
    except Exception as e:
        print("❌ Login error:", e)
        traceback.print_exc()
        return jsonify(success=False, error="Server error. Please try again."), 500


@auth_bp.route("/verify_otp", methods=["POST"])
@limiter.limit("10 per minute")  # ✅ Allow multiple OTP attempts
def verify_otp():
    data = request.get_json()
    session_id, otp_input = data.get("session_id"), data.get("otp")
    record = otp_sessions.get(session_id)
    if not record:
        return jsonify(verified=False, error="Session not found")
    if time.time() > record["expires"]:
        otp_sessions.pop(session_id, None)
        return jsonify(verified=False, error="OTP expired")
    if otp_input == record["otp"]:
        otp_sessions.pop(session_id, None)
        return jsonify(verified=True)
    return jsonify(verified=False, error="Invalid OTP")

@auth_bp.route("/resend_otp", methods=["POST"])
@limiter.limit("5 per minute")
def resend_otp():
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        
        if not session_id or session_id not in otp_sessions:
             return jsonify({"sent": False, "error": "Session expired or invalid. Please login again."}), 400

        session = otp_sessions[session_id]
        email = session["email"]
        name = session["name"]
        
        # Generate new OTP
        new_otp = "".join(random.choices(string.digits, k=6))
        
        # Update session
        otp_sessions[session_id]["otp"] = new_otp
        otp_sessions[session_id]["expires"] = time.time() + 180 # Extend timer
        
        # Send email
        if send_otp_email(email, new_otp, name):
            print(f"✅ OTP Resent to {email}")
            return jsonify({"sent": True, "message": "OTP resent successfully"}), 200
        else:
            return jsonify({"sent": False, "error": "Failed to send email"}), 500
            
    except Exception as e:
        print("❌ Resend OTP error:", e)
        traceback.print_exc()
        return jsonify({"sent": False, "error": "Server error"}), 500
