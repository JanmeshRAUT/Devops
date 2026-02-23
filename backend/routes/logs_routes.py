
from flask import Blueprint, request, jsonify
import traceback
import sys
import os
import json
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import (
    SessionLocal,
    get_access_logs_by_patient,
    get_access_logs_by_user,
    get_access_logs,
    get_audit_logs,
    get_audit_logs_by_type
)
from middleware import verify_admin_token
from encryption import decrypt_sensitive_data

logs_bp = Blueprint('logs_routes', __name__)

@logs_bp.route("/patient_access_history/<patient_name>", methods=["GET"])
def get_patient_access_history(patient_name):
    db = SessionLocal()
    try:
        from database import get_patient_by_name
        patient = get_patient_by_name(db, patient_name)
        if not patient:
            return jsonify({"success": False, "message": "Patient not found"}), 404

        logs = get_access_logs_by_patient(db, patient.id)
        logs_data = [{
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "status": log.status,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "is_emergency": log.is_emergency,
            "justification": log.justification
        } for log in logs]

        return jsonify({
            "success": True,
            "logs": logs_data,
            "count": len(logs_data)
        }), 200

    except Exception as e:
        print(f"❌ patient_access_history error: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        db.close()

@logs_bp.route("/all_doctor_access_logs", methods=["GET"])
@verify_admin_token
def get_all_doctor_access_logs():
    db = SessionLocal()
    try:
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        logs_obj = get_access_logs(db)
        logs_data = []

        for log in logs_obj:
            log_entry = {
                "id": log.id,
                "user_id": log.user_id,
                "patient_id": log.patient_id,
                "action": log.action,
                "status": log.status,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None
            }

            if log.timestamp:
                log_date = log.timestamp.date()
                if start_date:
                    try:
                        start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
                        if log_date < start_dt:
                            continue
                    except:
                        pass
                if end_date:
                    try:
                        end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()
                        if log_date > end_dt:
                            continue
                    except:
                        pass

            logs_data.append(log_entry)

        logs_data = logs_data[:500]

        return jsonify({
            "success": True,
            "logs": logs_data,
            "total_count": len(logs_data),
            "filters": {"start_date": start_date, "end_date": end_date}
        }), 200
    except Exception as e:
        print("❌ get_all_doctor_access_logs error:", e)
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@logs_bp.route("/doctor_access_logs/<user_id>", methods=["GET"])
def get_doctor_access_logs(user_id):
    db = SessionLocal()
    try:
        logs = get_access_logs_by_user(db, user_id)
        logs_data = [{
            "id": log.id,
            "patient_id": log.patient_id,
            "action": log.action,
            "status": log.status,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        } for log in logs]

        return jsonify({
            "success": True,
            "logs": logs_data,
            "count": len(logs_data)
        }), 200
    except Exception as e:
        print(f"❌ get_doctor_access_logs error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@logs_bp.route("/patient_access_logs/<patient_name>", methods=["GET"])
def patient_access_logs(patient_name):
    db = SessionLocal()
    try:
        from database import get_patient_by_name
        patient = get_patient_by_name(db, patient_name)
        if not patient:
            return jsonify({"success": False, "message": "Patient not found"}), 404

        logs = get_access_logs_by_patient(db, patient.id)
        logs_data = [{
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "status": log.status,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        } for log in logs]

        return jsonify({"success": True, "logs": logs_data, "count": len(logs_data)}), 200
    except Exception as e:
        print(f"❌ patient_access_logs error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@logs_bp.route("/access_logs/admin", methods=["GET"])
@verify_admin_token
def access_logs_admin():
    db = SessionLocal()
    try:
        logs = get_access_logs(db)
        logs_data = [{
            "id": log.id,
            "user_id": log.user_id,
            "patient_id": log.patient_id,
            "action": log.action,
            "status": log.status,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "is_emergency": log.is_emergency
        } for log in logs]

        audit_logs = get_audit_logs(db)
        audit_data = [{
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "status": log.status,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        } for log in audit_logs]

        return jsonify({
            "success": True,
            "access_logs": logs_data,
            "audit_logs": audit_data,
            "total_access_logs": len(logs_data),
            "total_audit_logs": len(audit_data)
        }), 200
    except Exception as e:
        print("❌ access_logs_admin error:", e)
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

            if log.get("doctor_name") == doctor_name:
                logs.append(log)
        logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return jsonify({"success": True, "logs": logs, "count": len(logs)}), 200
    except Exception as e:
        print("❌ get_doctor_access_logs error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@logs_bp.route("/patient_access_logs/<patient_name>", methods=["GET"])
def patient_access_logs(patient_name):
    try:
        logs = []
        patient_name_lower = patient_name.lower().strip()
        for log in get_system_logs():
            if log.get("patient_name", "").lower() == patient_name_lower:
                logs.append(log)
        logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return jsonify({"success": True, "logs": logs}), 200
    except Exception as e:
        print("❌ patient_access_logs error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@logs_bp.route("/doctor_patient_interactions/<doctor_name>", methods=["GET"])
def get_doctor_patient_interactions(doctor_name):
    try:
        logs = []
        for log in get_doctor_logs():
            if log.get("doctor_name") == doctor_name:
                logs.append(log)

        unique_patients = {}
        for log in logs:
            patient = (log.get("patient_name") or "").lower()
            if not patient or patient == "n/a":
                continue
            if patient not in unique_patients:
                unique_patients[patient] = {"patient_name": log.get("patient_name", ""), "access_count": 0, "last_access": log.get("timestamp", ""), "statuses": []}
            unique_patients[patient]["access_count"] += 1
            unique_patients[patient]["statuses"].append(log.get("status", ""))
        patients_list = list(unique_patients.values())
        return jsonify({"success": True, "patients": patients_list, "total_interactions": len(logs)}), 200
    except Exception as e:
        print("❌ doctor_patient_interactions error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@logs_bp.route("/doctor_patients/<doctor_name>", methods=["GET"])
def get_doctor_patients(doctor_name):
    try:
        patients_list = []

        all_patients = get_all_patients_static()
        for patient in all_patients:
            if patient.get("last_updated_by") == doctor_name:

                p_copy = patient.copy()

                patients_list.append(p_copy)

        patients_list.sort(key=lambda x: x.get("last_updated_at", ""), reverse=True)

        return jsonify({
            "success": True,
            "patients": patients_list,
            "count": len(patients_list)
        }), 200

    except Exception as e:
        print(f"❌ get_doctor_patients error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@logs_bp.route("/all_nurse_access_logs", methods=["GET"])
@verify_admin_token
def get_all_nurse_access_logs():
    try:
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        logs = []
        for log in get_nurse_logs():
            log_entry = log.copy()
            if start_date or end_date:
                log_timestamp = log_entry.get("timestamp", "")
                if log_timestamp:
                    log_date = log_timestamp.split(" ")[0]
                    if start_date and log_date < start_date:
                        continue
                    if end_date and log_date > end_date:
                        continue
            logs.append(log_entry)

        logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        logs = logs[:500]

        return jsonify({
            "success": True,
            "logs": logs,
            "total_count": len(logs),
            "filters": {"start_date": start_date, "end_date": end_date}
        }), 200
    except Exception as e:
        print("❌ get_all_nurse_access_logs error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@logs_bp.route("/nurse_access_logs/<nurse_name>", methods=["GET"])
def get_nurse_access_logs(nurse_name):
    try:
        logs = []
        for log in get_nurse_logs():
            if log.get("nurse_name") == nurse_name:
                logs.append(log)
        logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return jsonify({"success": True, "logs": logs, "count": len(logs)}), 200
    except Exception as e:
        print("❌ get_nurse_access_logs error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@logs_bp.route("/access_logs/admin", methods=["GET"])
@verify_admin_token
def access_logs_admin():
    try:
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        logs = []
        for log in get_system_logs():
            log_entry = log.copy()
            if start_date or end_date:
                log_timestamp = log_entry.get("timestamp", "")
                if log_timestamp:
                    log_date = log_timestamp.split(" ")[0]
                    if start_date and log_date < start_date:
                        continue
                    if end_date and log_date > end_date:
                        continue
            logs.append(log_entry)

        logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        logs = logs[:500]

        return jsonify({
            "success": True,
            "logs": logs,
            "count": len(logs),
            "filters": {"start_date": start_date, "end_date": end_date}
        }), 200
    except Exception as e:
        print("❌ access_logs_admin error:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@logs_bp.route("/update_log_status", methods=["POST"])
@verify_admin_token
def update_log_status():
    return jsonify({"success": False, "message": "Log updates not supported in static mode"}), 400
