
from flask import Blueprint, request, jsonify
from datetime import datetime
import traceback
import sys
import os
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, get_all_users, get_user_by_email, create_user, update_user, delete_user, create_audit_log
from limiter import limiter
from middleware import verify_admin_token
from helpers import patient_doc_id

user_bp = Blueprint('user_routes', __name__)

@user_bp.route("/get_all_users", methods=["GET"])
@verify_admin_token
def get_all_users_route():
    db = SessionLocal()
    try:
        print("📤 GET /get_all_users - fetching from PostgreSQL...")

        users = get_all_users(db)
        users_data = [{
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "created_at": u.created_at.isoformat() if u.created_at else None
        } for u in users]
        users_data.sort(key=lambda x: x.get("name", "").lower())
        return jsonify({"success": True, "users": users_data, "count": len(users_data)}), 200
    except Exception as e:
        print("❌ Error fetching users:", e)
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@user_bp.route("/register_user", methods=["POST"])
@limiter.limit("10 per hour")
def register_user():
    db = SessionLocal()
    try:
        data = request.get_json()
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        role = data.get("role", "").strip().lower()
        password = data.get("password", "DefaultPass").strip()
        age = data.get("age", 0)
        gender = data.get("gender", "")

        if not all([name, email, role]):
            return jsonify({"success": False, "message": "❌ Missing required fields (name, email, role)."}), 400

        if get_user_by_email(db, email):
            return jsonify({"success": False, "message": "⚠️ User already registered."}), 409

        prefix = "USR"
        if role == "doctor": prefix = "DOC"
        elif role == "nurse": prefix = "NUR"
        elif role == "admin": prefix = "ADM"
        elif role == "patient": prefix = "PT"

        unique_id = f"{prefix}-{str(uuid.uuid4())[:8].upper()}"

        new_user = {
            "id": unique_id,
            "name": name,
            "email": email,
            "password": password,
            "role": role,
            "age": int(age) if age else None,
            "gender": gender if gender else None,
            "created_at": datetime.utcnow(),
            "status": "active"
        }

        if role == "doctor":
            new_user["specialization"] = data.get("specialization", "General Medicine")
            new_user["hospital"] = data.get("hospital", "General Hospital")
            new_user["license_number"] = data.get("license_number", "N/A")
            new_user["phone"] = data.get("phone", "")
        elif role == "nurse":
            new_user["certification"] = data.get("certification", "RN")
            new_user["department"] = data.get("department", "General Ward")
            new_user["hospital"] = data.get("hospital", "General Hospital")
            new_user["employee_id"] = data.get("employee_id", "N/A")
            new_user["phone"] = data.get("phone", "")
        elif role == "patient":
            new_user["blood_type"] = data.get("blood_type", "Unknown")
            new_user["phone"] = data.get("phone", "")
            new_user["address"] = data.get("address", "")
            new_user["emergency_contact"] = data.get("emergency_contact", "")

        created_user = create_user(db, new_user)
        create_audit_log(db, {
            "user_id": unique_id,
            "action": "USER_REGISTERED",
            "entity_type": "User",
            "entity_id": unique_id,
            "status": "success"
        })
        print(f"👤 User registered: {name} ({role}) - ID: {unique_id}")

        return jsonify({
            "success": True,
            "message": f"Registered {name} ({role}) successfully.",
            "user_id": unique_id
        }), 200

    except Exception as e:
        print("❌ Error registering user:", e)
        traceback.print_exc()
        create_audit_log(db, {
            "action": "USER_REGISTRATION_FAILED",
            "entity_type": "User",
            "status": "error"
        })
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        db.close()

@user_bp.route("/delete_user/<user_email>", methods=["DELETE"])
@verify_admin_token
@limiter.limit("10 per hour")
def delete_user_route(user_email):