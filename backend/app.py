

from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import warnings

warnings.filterwarnings("ignore", ".*Google will stop supporting.*", category=FutureWarning)

from limiter import limiter
from ml_logic import load_ml_model, ml_model
import firebase_init

from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.patient_routes import patient_bp
from routes.access_routes import access_bp
from routes.logs_routes import logs_bp
from routes.general_routes import general_bp

app = Flask(__name__)

limiter.init_app(app)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5000",
            "https://*.vercel.app",
            "https://pbl6-40m0.onrender.com",
            "*"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, supports_credentials=True)

CORS(app, origins="*")

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "success": False,
        "error": "❌ Too many requests. Please try again later.",
        "message": str(e.description)
    }), 429

app.register_blueprint(general_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(patient_bp)
app.register_blueprint(access_bp)
app.register_blueprint(logs_bp)

if os.getenv("WERKZEUG_RUN_MAIN") == "true":
    print("\n🧠 Loading ML model at startup...")
    load_ml_model()

if __name__ == "__main__":

    port = int(os.getenv("PORT", 5000))

    is_production = os.getenv("FLASK_ENV", "").lower() == "production"

    print(f"\n🚀 Starting Flask app on port {port} (FLASK_ENV={os.getenv('FLASK_ENV', 'development')})")
    print(f"   Environment: {'PRODUCTION' if is_production else 'DEVELOPMENT'}")
    print(f"   Auto-reload: {'OFF' if is_production else 'ON (reloads on file changes)'}\n")

    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=not is_production)
