
from flask import Blueprint, request, jsonify
from datetime import datetime
import traceback
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import database functions
from database import (
    SessionLocal,
    get_patient_by_name,
    create_access_log,
    create_audit_log,
    get_user_by_email,
    get_trust_score,
    update_trust_score
)
from limiter import limiter
from utils import get_client_ip_from_request, is_ip_in_network, TRUST_THRESHOLD
from trust_logic import safe_log_access
from ml_logic import analyze_justification
from encryption import encrypt_sensitive_data, decrypt_sensitive_data

access_bp = Blueprint('access_routes', __name__)

@access_bp.route("/normal_access", methods=["POST"])
@limiter.limit("30 per hour")
def normal_access():
    db = SessionLocal()
    data = request.get_json()
    name, role = data.get("name"), data.get("role")
    patient_name = (data.get("patient_name") or "").strip()
    ip = get_client_ip_from_request(request)
    print(f"🏥 Normal Access Attempt: {name} from {ip}")
    try:
        if not is_ip_in_network(ip):
            create_access_log(db, {
                "user_id": name,
                "patient_id": patient_name,
                "action": "NORMAL_ACCESS",
                "status": "BLOCKED",
                "reason": "Outside Network",
                "ip_address": ip,
                "timestamp": datetime.utcnow()
            })
            
            # Update trust score
            user = get_user_by_email(db, name)
            if user:
                ts = get_trust_score(db, user.id, patient_name) or update_trust_score(db, user.id, patient_name, 35)
            
            return jsonify({"success": False, "message": "❌ Access denied — outside hospital network.", "patient_data": {}, "pdf_link": None}), 403
        
        patient_info = get_patient_by_name(db, patient_name)
        
        if not patient_info:
            return jsonify({"success": False, "message": f"❌ Patient '{patient_name}' not found"}), 404
        
        user = get_user_by_email(db, name)
        create_access_log(db, {
            "user_id": user.id if user else name,
            "patient_id": patient_info.id,
            "action": "NORMAL_ACCESS",
            "status": "SUCCESS",
            "ip_address": ip,
            "timestamp": datetime.utcnow()
        })
        
        # Update trust score positively
        if user:
            update_trust_score(db, user.id, patient_info.id, 52)
        
        print(f"✅ Access granted to {name} for {patient_name}")
        
        return jsonify({
            "success": True, 
            "message": f"✅ Patient data accessed for {patient_name}",
            "patient_data": {
                "id": patient_info.id,
                "name": patient_info.name,
                "age": patient_info.age,
                "diagnosis": patient_info.diagnosis
            },
            "pdf_link": f"/api/generate_patient_pdf/{patient_name}"
        }), 200
        
    except Exception as e:
        print(f"❌ normal_access error: {e}")
        traceback.print_exc()
        create_audit_log(db, {
            "action": "NORMAL_ACCESS_ERROR",
            "entity_type": "Access",
            "status": "error"
        })
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        db.close()


@access_bp.route("/restricted_access", methods=["POST"])
@limiter.limit("20 per hour")
def restricted_access():
    data = request.get_json()
    name, role = data.get("name"), data.get("role")
    justification = (data.get("justification") or "").strip()
    patient_name = (data.get("patient_name") or "").strip()
    ip = get_client_ip_from_request(request)
    user_trust = get_trust_score(name)
    try:
        if is_ip_in_network(ip):
            safe_log_access({
                "doctor_name": name,
                "doctor_role": role,
                "action": "Restricted Access (In-Network)",
                "ip": ip,
                "status": "Granted",
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            })
            update_trust_score(name, +1)
            
            patient_info = get_patient_by_name(patient_name)
            if not patient_info:
                return jsonify({"success": False, "message": "❌ Patient not found", "patient_data": {}, "pdf_link": None}), 404
            
            patient_info_decrypted = patient_info.copy()
            patient_info_decrypted = decrypt_sensitive_data(patient_info_decrypted, ["diagnosis", "treatment", "notes"])

            pdf_link = f"/generate_patient_pdf/{patient_name}"
            return jsonify({"success": True, "message": "⚠️ Restricted access granted (inside hospital).", "patient_data": patient_info_decrypted, "pdf_link": pdf_link}), 200

        if user_trust < TRUST_THRESHOLD:
            safe_log_access({
                "doctor_name": name,
                "doctor_role": role,
                "action": "Restricted Access (Low Trust)",
                "ip": ip,
                "status": "Denied",
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            })
            update_trust_score(name, -5)
            return jsonify({"success": False, "message": "❌ Low trust — access denied.", "patient_data": {}, "pdf_link": None}), 403

        if not justification:
            return jsonify({"success": False, "message": "📝 Justification required for outside access.", "patient_data": {}, "pdf_link": None}), 400

        label, score = analyze_justification(justification)
        is_valid = (label in ["emergency", "restricted"]) and (score > 0.55)

        log_data = {
            "doctor_name": name,
            "doctor_role": role,
            "action": "Restricted Access (Outside Network)",
            "justification": justification,
            "ai_label": label,
            "ai_confidence": score,
            "ip": ip,
            "status": "Granted" if is_valid else "Flagged",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        safe_log_access(log_data)
        update_trust_score(name, +2 if is_valid else -3)

        patient_info = get_patient_by_name(patient_name)
        if not patient_info:
            return jsonify({"success": False, "message": "❌ Patient not found", "patient_data": {}, "pdf_link": None}), 404
        
        patient_info_decrypted = patient_info.copy()
        patient_info_decrypted = decrypt_sensitive_data(patient_info_decrypted, ["diagnosis", "treatment", "notes"])
        
        pdf_link = f"/generate_patient_pdf/{patient_name}"
        return jsonify({"success": is_valid, "message": ("🌐 Restricted Access Granted ✅" if is_valid else "⚠️ Access flagged for review."), "patient_data": patient_info_decrypted, "pdf_link": pdf_link}), (200 if is_valid else 403)
    except Exception as e:
        print("❌ restricted_access error:", e)
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

@access_bp.route("/emergency_access", methods=["POST"])
@limiter.limit("15 per hour")
def emergency_access():
    data = request.get_json()
    name = data.get("name")
    role = data.get("role")
    justification = (data.get("justification") or "").strip()
    patient_name = (data.get("patient_name") or "").strip()
    ip = get_client_ip_from_request(request)

    if not justification:
        update_trust_score(name, -2)
        return jsonify({
            "success": False,
            "message": "❌ Justification required!",
            "patient_data": {},
            "pdf_link": None
        }), 400

    label, score = analyze_justification(justification)

    # 🚑 STRICT & SAFE emergency logic
    genuine = (label == "emergency" and score > 0.70)

    # Log access
    log_data = {
        "doctor_name": name,
        "doctor_role": role,
        "patient_name": patient_name,
        "action": "Emergency Access",
        "justification": justification,
        "ai_label": label,
        "confidence": score,
        "ip": ip,
        "status": "Approved" if genuine else "Flagged",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }
    safe_log_access(log_data)

    update_trust_score(name, +3 if genuine else -10)
    msg = "🚑 Emergency access approved ✅" if genuine else "⚠️ Suspicious justification — logged."

    # Fetch patient data
    patient_info = get_patient_by_name(patient_name)

    if not patient_info and patient_name:
        return jsonify({
            "success": False,
            "message": "❌ Patient not found",
            "patient_data": {},
            "pdf_link": None
        }), 404

    patient_info_decrypted = None
    if patient_info:
        patient_info_decrypted = patient_info.copy()
        patient_info_decrypted = decrypt_sensitive_data(patient_info_decrypted, ["diagnosis", "treatment", "notes"])

    pdf_link = f"/generate_patient_pdf/{patient_name}" if patient_info else None

    return jsonify({
        "success": genuine,
        "message": msg,
        "patient_data": patient_info_decrypted or {},
        "pdf_link": pdf_link
    }), (200 if genuine else 403)


@access_bp.route("/precheck", methods=["POST"])
@limiter.limit("60 per hour")
def precheck_access():
    try:
        data = request.get_json()
        text = (data.get("justification") or "").strip()
        
        if not text:
            return jsonify({
                "status": "invalid",
                "message": "Enter justification...",
                "score": 0.0
            })

        # Run AI Analysis
        label, score = analyze_justification(text)
        
        # Determine User Feedback
        if label == "emergency":
            if score > 0.8:
                return jsonify({"status": "valid", "message": "✅ Excellent justification", "score": score})
            if score > 0.6:
                return jsonify({"status": "weak", "message": "🟡 Good, but maintain detail", "score": score})
            else:
                return jsonify({"status": "weak", "message": "⚠️ Weak medical context", "score": score})
                
        elif label == "restricted":
            # Restricted is acceptable for remote, but check score
            if score > 0.7:
                 return jsonify({"status": "valid", "message": "✅ Valid reason", "score": score})
            else:
                 return jsonify({"status": "weak", "message": "🟡 Vague reason", "score": score})
                 
        else: # invalid/admin/non-medical
            return jsonify({"status": "invalid", "message": "🔴 Invalid justification", "score": score})

    except Exception as e:
        print("❌ precheck error:", e)
        return jsonify({"status": "invalid", "message": "Analysis unavailable", "score": 0.0}), 500


@access_bp.route("/log_access", methods=["POST"])
@limiter.limit("100 per hour")
def log_access():
    try:
        data = request.get_json()
        doctor_name = data.get("doctor_name") or data.get("name", "Unknown")
        doctor_role = data.get("doctor_role") or data.get("role", "Unknown")
        patient_name = data.get("patient_name", "N/A")
        log = {
            "doctor_name": doctor_name,
            "doctor_role": doctor_role,
            "patient_name": patient_name,
            "action": data.get("action", "Unknown"),
            "justification": data.get("justification", ""),
            "status": data.get("status", "Pending"),
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Use static_db logging
        add_access_log(log)
        
        # Log to DoctorAccessLog
        if doctor_name != "Unknown" and patient_name != "N/A" and (doctor_role or "").lower() == "doctor":
            doctor_access_log = {
                "doctor_name": doctor_name,
                "patient_name": patient_name,
                "action": data.get("action", "Unknown"),
                "status": data.get("status", "Pending"),
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                "created_at": datetime.utcnow().isoformat()
            }
            add_doctor_log(doctor_access_log)
        
        # Log to NurseAccessLog
        if doctor_name != "Unknown" and (doctor_role or "").lower() == "nurse":
            nurse_access_log = {
                "nurse_name": doctor_name,
                "patient_name": patient_name,
                "action": data.get("action", "Unknown"),
                "status": data.get("status", "Pending"),
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                "created_at": datetime.utcnow().isoformat()
            }
            add_nurse_log(nurse_access_log)
            
        print(f"🩺 Log added: {doctor_name} - {log['action']}")
        return jsonify({"message": "Access logged ✅"})

    except Exception as e:
        print("❌ log_access error:", e)
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500

@access_bp.route("/request_temp_access", methods=["POST"])
def request_temp_access():
    data = request.get_json()
    name = data.get("name")
    role = data.get("role")
    patient_name = (data.get("patient_name") or "").strip()
    ip = get_client_ip_from_request(request)
    if (role or "").strip().lower() != "nurse":
        return jsonify({"success": False, "message": "❌ Only nurses can request temporary access"}), 403
    try:
        if not is_ip_in_network(ip):
            update_trust_score(name, -3)
            return jsonify({"success": False, "message": "❌ Temporary access only available inside hospital network"}), 403

        # Check patient exists
        patient_info = get_patient_by_name(patient_name)
        if not patient_info:
            return jsonify({"success": False, "message": "❌ Patient not found", "patient_data": {}, "pdf_link": None}), 404

        # Log request
        temp_access_log = {
            "doctor_name": name,
            "doctor_role": role,
            "action": "Temporary Access Request",
            "patient_name": patient_name,
            "ip": ip,
            "status": "Granted",
            "duration": "30 minutes",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        add_access_log(temp_access_log)
        add_nurse_log({
            "nurse_name": name,
            "patient_name": patient_name,
            "action": "Temporary Access Request",
            "status": "Granted",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "created_at": datetime.utcnow().isoformat()
        })

        update_trust_score(name, +1)
        
        patient_info_decrypted = patient_info.copy()
        patient_info_decrypted = decrypt_sensitive_data(patient_info_decrypted, ["diagnosis", "treatment", "notes"])

        pdf_link = f"/generate_patient_pdf/{patient_name}"
        return jsonify({
            "success": True,
            "message": "✅ Temporary access granted for 30 minutes",
            "patient_data": patient_info_decrypted,
            "pdf_link": pdf_link
        }), 200
    except Exception as e:
        print("❌ request_temp_access error:", e)
        traceback.print_exc()
        return jsonify({"success": False, "message": "Server error"}), 500
