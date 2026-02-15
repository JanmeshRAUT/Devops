"""
Data Manager - Manages static JSON file operations for users, patients, and logs
"""
import json
import os
from datetime import datetime

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_USERS_FILE = os.path.join(BACKEND_DIR, "static_users.json")
STATIC_DATA_FILE = os.path.join(BACKEND_DIR, "static_data.json")

def load_users():
    """Load all users from static database"""
    try:
        with open(STATIC_USERS_FILE, 'r') as f:
            data = json.load(f)
            return data.get("users", [])
    except Exception as e:
        print(f"❌ Error loading users: {e}")
        return []

def save_users(users):
    """Save users to static database"""
    try:
        with open(STATIC_USERS_FILE, 'w') as f:
            json.dump({"users": users}, f, indent=2)
        return True
    except Exception as e:
        print(f"❌ Error saving users: {e}")
        return False

def load_data():
    """Load all data (patients, logs, etc)"""
    try:
        with open(STATIC_DATA_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return {"patients": [], "access_logs": [], "doctor_access_logs": []}

def save_data(data):
    """Save all data"""
    try:
        with open(STATIC_DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"❌ Error saving data: {e}")
        return False

def add_access_log(patient_name, accessed_by, access_type="view"):
    """Add access log entry"""
    data = load_data()
    log_entry = {
        "patient_name": patient_name,
        "accessed_by": accessed_by,
        "access_type": access_type,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    }
    data["access_logs"].append(log_entry)
    save_data(data)
    return log_entry

def get_patient_by_name(name):
    """Find patient by name"""
    data = load_data()
    for patient in data.get("patients", []):
        if patient.get("name").lower() == name.lower():
            return patient
    return None

def get_all_patients():
    """Get all patients"""
    data = load_data()
    return data.get("patients", [])

def add_patient(patient_data):
    """Add new patient"""
    data = load_data()
    new_id = max([p.get("id", 0) for p in data.get("patients", [])], default=0) + 1
    patient_data["id"] = new_id
    patient_data["created_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    data["patients"].append(patient_data)
    save_data(data)
    return patient_data

def update_patient(name, updates):
    """Update patient data"""
    data = load_data()
    for patient in data.get("patients", []):
        if patient.get("name").lower() == name.lower():
            patient.update(updates)
            save_data(data)
            return patient
    return None

def delete_patient(name):
    """Delete patient"""
    data = load_data()
    patients = data.get("patients", [])
    filtered = [p for p in patients if p.get("name").lower() != name.lower()]
    if len(filtered) < len(patients):
        data["patients"] = filtered
        save_data(data)
        return True
    return False
