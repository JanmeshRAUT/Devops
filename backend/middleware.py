
from functools import wraps
from flask import request, jsonify
from database import SessionLocal, get_user_by_email
from token_manager import verify_token
from utils import ADMIN_EMAIL

def verify_admin_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):