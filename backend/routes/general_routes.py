
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