
from flask import Blueprint, request, jsonify
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import ml_logic
from trust_logic import get_trust_score as get_trust_score_logic
from utils import get_client_ip_from_request, is_ip_in_network
from database import SessionLocal, get_database_stats, get_trust_score

general_bp = Blueprint('general_routes', __name__)

@general_bp.route("/", methods=["GET"])
def home():
    return jsonify({"message": "🏥 MedTrust AI – Secure EHR Backend (PostgreSQL) ✅"})

@general_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for monitoring connectivity and service status"""
    db = SessionLocal()
    try:
        stats = get_database_stats(db)
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "mode": "postgresql",
            "database_stats": stats,
            "ml_model": "loaded" if ml_logic.ml_model is not None else "not loaded",
            "version": "1.0.0"
        }
        return jsonify(health_status), 200
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }), 500
    finally:
        db.close()

@general_bp.route("/trust_score/<user_id>/<patient_id>", methods=["GET"])
def trust_score_route(user_id, patient_id):
    db = SessionLocal()
    try:
        trust_score_entry = get_trust_score(db, user_id, patient_id)
        if trust_score_entry:
            return jsonify({
                "success": True,
                "trust_score": trust_score_entry.score,
                "factors": trust_score_entry.factors
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Trust score not found"
            }), 404
    except Exception as e:
        print(f"❌ Trust score error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@general_bp.route("/ip_check", methods=["GET"])
def ip_check():
    ip = get_client_ip_from_request(request)
    inside = is_ip_in_network(ip)
    return jsonify({"ip": ip, "inside_network": inside})

