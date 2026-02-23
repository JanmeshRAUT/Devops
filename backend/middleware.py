
from functools import wraps
from flask import request, jsonify
from database import SessionLocal, get_user_by_email
from token_manager import verify_token
from utils import ADMIN_EMAIL

# ---------- Authorization Decorator ----------
def verify_admin_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        """Verify admin access - PostgreSQL Database (Firebase disabled)"""
        # ✅ Check for Authorization header with Bearer token
        authorization = request.headers.get("Authorization")
        
        if not authorization:
            print("🚫 Missing Authorization header")
            return jsonify({"success": False, "error": "Missing Authorization header"}), 401
        
        db = SessionLocal()
        try:
            # ✅ Extract Bearer token
            if authorization.startswith("Bearer "):
                token = authorization.split("Bearer ")[1]
                print(f"📋 Token received: {type(token)} length={len(str(token))}")
                print(f"   Token preview: {str(token)[:50]}...")
                
                # ✅ Verify token using centralized token manager
                session = verify_token(token)
                
                if not session:
                    print(f"🚫 Invalid or expired token")
                    return jsonify({"success": False, "error": "Invalid or expired token"}), 401
                
                # ✅ Verify user is still an admin
                email = session.get("email")
                user = get_user_by_email(db, email)
                
                if not user or user.role != "admin":
                    print(f"🚫 User is not an admin: {email}")
                    return jsonify({"success": False, "error": "Not an admin"}), 403
                
                # ✅ Token is valid, proceed
                return f(*args, **kwargs)
            else:
                print("🚫 Invalid authorization format")
                return jsonify({"success": False, "error": "Invalid authorization format"}), 401
            
        except Exception as e:
            print(f"❌ Token verification error: {e}")
            return jsonify({"success": False, "error": "Token verification failed"}), 401
        finally:
            db.close()
    
    return decorated_function

