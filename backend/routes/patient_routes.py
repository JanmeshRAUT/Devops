
from flask import Blueprint, request, jsonify, send_file
from datetime import datetime
import traceback
import sys
import os
import json
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import (
    SessionLocal,
    create_patient,
    update_patient,
    get_patient_by_name,
    get_all_patients,
    delete_patient,
    create_access_log,
    create_audit_log
)
from limiter import limiter
from middleware import verify_admin_token
from utils import create_patient_pdf_bytes
from encryption import encrypt_sensitive_data, decrypt_sensitive_data

patient_bp = Blueprint('patient_routes', __name__)

FONT_CANDIDATES = [
    "fonts/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "C:\\Windows\\Fonts\\DejaVuSans.ttf"
]

@patient_bp.route("/add_patient", methods=["POST"])
@limiter.limit("20 per hour")
def add_patient():
    db = SessionLocal()
    try:
        data = request.get_json()
        doctor_name = data.get("doctor_name")
        patient_name = (data.get("patient_name") or "").strip()
        patient_email = data.get("patient_email", "")
        age = data.get("age", 0)
        gender = data.get("gender", "")
        diagnosis = data.get("diagnosis", "")
        treatment = data.get("treatment", "")
        notes = data.get("notes", "")

        if not all([doctor_name, patient_name, patient_email, diagnosis]):
            return jsonify({"success": False, "message": "❌ Missing required fields"}), 400

        patient_id = f"PT-{str(uuid.uuid4())[:8].upper()}"

        patient_data = {
            "id": patient_id,
            "user_id": patient_id,
            "name": patient_name,
            "email": patient_email,
            "age": int(age),
            "gender": gender,
            "diagnosis": diagnosis,
            "address": data.get("address", ""),
            "emergency_contact": data.get("emergency_contact", ""),
            "phone": data.get("phone", ""),
            "status": "active",
            "created_at": datetime.utcnow()
        }

        created_patient = create_patient(db, patient_data)

        create_access_log(db, {
            "user_id": doctor_name,
            "patient_id": patient_id,
            "action": "ADD_PATIENT",
            "status": "SUCCESS",
            "timestamp": datetime.utcnow()
        })

        create_audit_log(db, {
            "user_id": doctor_name,
            "action": "PATIENT_CREATED",
            "entity_type": "Patient",
            "entity_id": patient_id,
            "status": "success"
        })

        print(f"✅ Patient {patient_name} added by Dr. {doctor_name}")
        return jsonify({"success": True, "message": f"✅ Patient {patient_name} registered successfully"}), 200

    except Exception as e:
        print("❌ Error adding patient:", e)
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        db.close()

@patient_bp.route("/update_patient", methods=["POST"])
@limiter.limit("50 per hour")
def update_patient_route():
    db = SessionLocal()
    try:
        data = request.get_json()
        patient_name = data.get("patient_name", "").strip()
        updates = data.get("updates", {})
        updated_by = data.get("updated_by", "Unknown")

        if not patient_name:
            return jsonify({"success": False, "message": "❌ Patient name is required"}), 400

        patient = get_patient_by_name(db, patient_name)

        if not patient:
            return jsonify({"success": False, "message": f"❌ Patient '{patient_name}' not found"}), 404

        patient_id = patient.id

        updates["updated_at"] = datetime.utcnow()

        updated_patient = update_patient(db, patient_id, updates)

        create_access_log(db, {
            "user_id": updated_by,
            "patient_id": patient_id,
            "action": "UPDATE_PATIENT",
            "status": "SUCCESS",
            "timestamp": datetime.utcnow()
        })

        create_audit_log(db, {
            "user_id": updated_by,
            "action": "PATIENT_UPDATED",
            "entity_type": "Patient",
            "entity_id": patient_id,
            "details": {"fields": list(updates.keys())},
            "status": "success"
        })

        return jsonify({
            "success": True,
            "message": f"✅ Patient '{patient_name}' updated successfully",
            "patient": {
                "id": updated_patient.id,
                "name": updated_patient.name,
                "email": updated_patient.email,
                "age": updated_patient.age,
                "diagnosis": updated_patient.diagnosis
            }
        }), 200

    except Exception as e:
        print(f"❌ update_patient error: {e}")
        traceback.print_exc()
        create_audit_log(db, {
            "action": "PATIENT_UPDATE_FAILED",
            "entity_type": "Patient",
            "status": "error"
        })
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500
    finally:
        db.close()

@patient_bp.route("/get_patient/<patient_name>", methods=["GET"])
def get_patient_route(patient_name):
    db = SessionLocal()
    try:
        patient = get_patient_by_name(db, patient_name)
        if patient:
            return jsonify({
                "success": True,
                "patient": {
                    "id": patient.id,
                    "name": patient.name,
                    "email": patient.email,
                    "age": patient.age,
                    "gender": patient.gender,
                    "phone": patient.phone,
                    "address": patient.address,
                    "diagnosis": patient.diagnosis,
                    "status": patient.status,
                    "created_at": patient.created_at.isoformat() if patient.created_at else None
                }
            }), 200
        return jsonify({"success": False, "message": "❌ Patient not found"}), 404
    except Exception as e:
        print("❌ get_patient error:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        db.close()

@patient_bp.route("/all_patients", methods=["GET"])
@verify_admin_token
def all_patients():
    db = SessionLocal()
    try:
        patients = get_all_patients(db)
        patients_data = [{
            "id": p.id,
            "name": p.name,
            "email": p.email,
            "age": p.age,
            "gender": p.gender,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None
        } for p in patients]
        return jsonify({"success": True, "patients": patients_data, "count": len(patients_data)}), 200
    except Exception as e:
        print("❌ all_patients error:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        db.close()

@patient_bp.route("/generate_patient_pdf/<patient_name>", methods=["GET"])
def generate_patient_pdf(patient_name):
    db = SessionLocal()
    try:
        if not patient_name or not patient_name.strip():
            return jsonify({"success": False, "message": "❌ Patient name is required"}), 400

        patient = get_patient_by_name(db, patient_name)
        if not patient:
            return jsonify({"success": False, "message": f"❌ Patient data not found for '{patient_name}'"}), 404

        patient_dict = {
            "name": patient.name,
            "email": patient.email,
            "age": patient.age,
            "gender": patient.gender,
            "phone": patient.phone,
            "address": patient.address,
            "diagnosis": patient.diagnosis,
            "created_at": patient.created_at.isoformat() if patient.created_at else None
        }

        FONT_CANDIDATES = [
            "fonts/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "C:\\Windows\\Fonts\\DejaVuSans.ttf"
        ]

        font_paths = [p for p in FONT_CANDIDATES if os.path.exists(p)]
        pdf_buffer = create_patient_pdf_bytes(patient_dict, font_paths=font_paths)

        filename = f"{(patient.name or 'patient').replace(' ', '_')}_EHR_Report.pdf"

        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=False,
            download_name=filename
        )

    except Exception as e:
        print(f"❌ PDF Generation Error: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500
    finally:
        db.close()

@patient_bp.route("/delete_patient/<patient_name>", methods=["DELETE"])
@limiter.limit("10 per hour")
def delete_patient_route(patient_name):
    db = SessionLocal()
    try:
        data = request.get_json() or {}
        admin_id = data.get("admin_id")

        patient = get_patient_by_name(db, patient_name)
        if not patient:
            return jsonify({"success": False, "message": "❌ Patient not found"}), 404

        patient_id = patient.id
        delete_patient(db, patient_id)

        create_audit_log(db, {
            "user_id": admin_id,
            "action": "PATIENT_DELETED",
            "entity_type": "Patient",
            "entity_id": patient_id,
            "status": "success"
        })

        print(f"Patient {patient_name} deleted")
        return jsonify({"success": True, "message": "✅ Patient deleted successfully"}), 200

    except Exception as e:
        print("❌ delete_patient error:", e)
        traceback.print_exc()
        create_audit_log(db, {
            "action": "PATIENT_DELETION_FAILED",
            "entity_type": "Patient",
            "status": "error"
        })
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        db.close()

