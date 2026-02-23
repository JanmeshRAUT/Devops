"""
PostgreSQL database initialization
Loads sample data from static_db.py on first run
"""

from database import SessionLocal, init_db, create_user, create_patient
import uuid
from datetime import timedelta, datetime

# Initialize database tables
init_db()


def load_sample_data():
    """Load sample users and patients from static_db into PostgreSQL"""
    db = SessionLocal()
    try:
        from static_db import ADMINS, DOCTORS, NURSES, PATIENTS
        
        # Load sample admin users
        for email, admin_data in ADMINS.items():
            try:
                user_data = {
                    "id": admin_data.get("id", f"admin_{uuid.uuid4().hex[:8]}"),
                    "email": email,
                    "name": admin_data["name"],
                    "password": admin_data["password"],
                    "role": "admin",
                    "status": admin_data.get("status", "active"),
                    "created_at": datetime.strptime(admin_data.get("created_at", "2024-01-01"), "%Y-%m-%d")
                }
                create_user(db, user_data)
                print(f"✅ Loaded admin: {email}")
            except Exception as e:
                print(f"⚠️  Skipped admin {email}: {str(e)}")
        
        # Load sample doctors
        for email, doctor_data in DOCTORS.items():
            try:
                user_data = {
                    "id": doctor_data.get("id", f"doc_{uuid.uuid4().hex[:8]}"),
                    "email": email,
                    "name": doctor_data["name"],
                    "password": doctor_data["password"],
                    "role": "doctor",
                    "specialization": doctor_data.get("specialization"),
                    "hospital": doctor_data.get("hospital"),
                    "license_number": doctor_data.get("license_number"),
                    "phone": doctor_data.get("phone"),
                    "status": doctor_data.get("status", "active"),
                    "created_at": datetime.strptime(doctor_data.get("created_at", "2024-01-01"), "%Y-%m-%d")
                }
                create_user(db, user_data)
                print(f"✅ Loaded doctor: {email}")
            except Exception as e:
                print(f"⚠️  Skipped doctor {email}: {str(e)}")
        
        # Load sample nurses
        for email, nurse_data in NURSES.items():
            try:
                user_data = {
                    "id": nurse_data.get("id", f"nurse_{uuid.uuid4().hex[:8]}"),
                    "email": email,
                    "name": nurse_data["name"],
                    "password": nurse_data["password"],
                    "role": "nurse",
                    "certification": nurse_data.get("certification"),
                    "department": nurse_data.get("department"),
                    "employee_id": nurse_data.get("employee_id"),
                    "phone": nurse_data.get("phone"),
                    "status": nurse_data.get("status", "active"),
                    "created_at": datetime.strptime(nurse_data.get("created_at", "2024-01-01"), "%Y-%m-%d")
                }
                create_user(db, user_data)
                print(f"✅ Loaded nurse: {email}")
            except Exception as e:
                print(f"⚠️  Skipped nurse {email}: {str(e)}")
        
        # Load sample patients
        for email, patient_data in PATIENTS.items():
            try:
                patient_id = patient_data.get("id", f"PT-{uuid.uuid4().hex[:8]}")
                patient_dict = {
                    "id": patient_id,
                    "user_id": patient_id,
                    "email": email,
                    "name": patient_data["name"],
                    "age": patient_data.get("age"),
                    "gender": patient_data.get("gender"),
                    "blood_type": patient_data.get("blood_type"),
                    "phone": patient_data.get("phone"),
                    "address": patient_data.get("address"),
                    "emergency_contact": patient_data.get("emergency_contact"),
                    "status": patient_data.get("status", "active")
                }
                create_patient(db, patient_dict)
                print(f"✅ Loaded patient: {email}")
            except Exception as e:
                print(f"⚠️  Skipped patient {email}: {str(e)}")
        
        print("\n✅ Sample data loaded successfully")
    
    except ImportError as e:
        print(f"⚠️  Static DB not found: {str(e)}")
    finally:
        db.close()


# Auto-load sample data on import
load_sample_data()
print("✅ PostgreSQL initialized - Firebase completely removed")



