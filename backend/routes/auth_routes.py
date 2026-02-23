
from flask import Blueprint, request, jsonify
import random
import string
import time
import traceback
import sys
import os

# Adjust path to import from parent directory if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from limiter import limiter
from database import SessionLocal, verify_user_credentials, create_audit_log
from token_manager import create_admin_token
from utils import send_otp_email, ADMIN_EMAIL

auth_bp = Blueprint('auth_routes', __name__)

# ---------- In-memory OTP sessions ----------
otp_sessions = {}

@auth_bp.route("/admin/login", methods=["POST"])
def admin_login():
    """Admin login using PostgreSQL database"""
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    db = SessionLocal()
    try:
        # Verify credentials using PostgreSQL database
        user = verify_user_credentials(db, email, password)
        
        if not user or user.role != "admin":
            print(f"🚫 Login failed for: {email}")
            create_audit_log(db, {
                "user_id": email,
                "action": "ADMIN_LOGIN_FAILED",
                "entity_type": "User",
                "status": "failed"
            })
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
        
        # ✅ Generate session token using token manager
        token = create_admin_token(user.id, email)
        
        print(f"✅ Admin verified: {email}")
        create_audit_log(db, {
            "user_id": user.id,
            "action": "ADMIN_LOGIN_SUCCESS",
            "entity_type": "User",
            "status": "success"
        })
        
        return jsonify({
            "success": True, 
            "message": "Admin verified ✅",
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }), 200
    
    finally:
        db.close()


@auth_bp.route("/user_login", methods=["POST"])
@limiter.limit("5 per minute")  # ✅ Prevent brute force
def user_login():
    """User login for Doctor, Nurse, Patient using PostgreSQL"""
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    
    # ✅ Validate required fields
    if not email or not password:
        return jsonify(success=False, error="Email and password are required"), 400
    
    # ✅ Validate email format
    if "@" not in email:
        return jsonify(success=False, error="Invalid email format"), 400
    
    db = SessionLocal()
    try:
        # Verify user credentials using PostgreSQL database
        user = verify_user_credentials(db, email, password)
        
        if not user:
            print(f"🚫 Login failed for: {email}")
            create_audit_log(db, {
                "user_id": email,
                "action": "USER_LOGIN_FAILED",
                "entity_type": "User",
                "status": "failed"
            })
            return jsonify(success=False, error="Invalid email or password"), 401
        
        role = user.role.lower()
        if role not in ["doctor", "nurse", "patient"]:
            return jsonify(success=False, error="Invalid user role"), 403
        
        # Generate OTP and create session
        otp = "".join(random.choices(string.digits, k=6))
        session_id = f"{user.name}_{int(time.time())}"
        otp_sessions[session_id] = {
            "otp": otp,
            "expires": time.time() + 180,
            "email": email,
            "name": user.name,
            "user_id": user.id,
            "role": role
        }
        
        # ✅ Send OTP to user email
        if send_otp_email(email, otp, user.name):
            print(f"✅ OTP sent to {email} for {user.name} ({role})")
            create_audit_log(db, {
                "user_id": user.id,
                "action": "OTP_SENT",
                "entity_type": "User",
                "status": "success"
            })
            return jsonify(success=True, session_id=session_id, message="✅ OTP sent to your email"), 200
        else:
            return jsonify(success=False, error="Failed to send OTP. Please try again."), 500
            
    except Exception as e:
        print("❌ Login error:", e)
        traceback.print_exc()
        create_audit_log(db, {
            "action": "USER_LOGIN_ERROR",
            "entity_type": "User",
            "status": "error",
            "details": {"error": str(e)}
        })
        return jsonify(success=False, error="Server error. Please try again."), 500
    
    finally:
        db.close()


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
