# data_manager.py - Data management using static database
# Replaces Firebase Firestore with in-memory storage

from datetime import datetime
import json

# ============================================
# IN-MEMORY DATA STORAGE
# ============================================

# Store patient data
PATIENTS_DB = {}

# Store access logs
ACCESS_LOGS_DB = []

# Store general logs
LOGS_DB = []

# ============================================
# PATIENT FUNCTIONS
# ============================================

def add_patient(patient_data):
    """Add a patient to the database"""
    patient_id = patient_data.get("id") or f"PT-{len(PATIENTS_DB) + 1:04d}"
    PATIENTS_DB[patient_id] = patient_data
    return patient_id

def get_patient_by_name(name):
    """Get patient by name"""
    for pid, patient in PATIENTS_DB.items():
        if patient.get("name", "").lower() == name.lower():
            return patient
    return None

def get_all_patients():
    """Get all patients"""
    return list(PATIENTS_DB.values())

def update_patient(patient_id, updated_data):
    """Update patient data"""
    if patient_id in PATIENTS_DB:
        PATIENTS_DB[patient_id].update(updated_data)
        return True
    return False

def delete_patient(patient_id):
    """Delete patient"""
    if patient_id in PATIENTS_DB:
        del PATIENTS_DB[patient_id]
        return True
    return False

def get_patient_by_id(patient_id):
    """Get patient by ID"""
    return PATIENTS_DB.get(patient_id)

# ============================================
# ACCESS LOG FUNCTIONS
# ============================================

def add_access_log(log_entry):
    """Add access log entry"""
    log_entry["timestamp"] = datetime.utcnow().isoformat()
    ACCESS_LOGS_DB.append(log_entry)
    return log_entry

def get_access_logs():
    """Get all access logs"""
    return ACCESS_LOGS_DB

def get_access_logs_by_patient(patient_id):
    """Get access logs for a specific patient"""
    return [log for log in ACCESS_LOGS_DB if log.get("patient_id") == patient_id]

def get_access_logs_by_user(user_id):
    """Get access logs by user"""
    return [log for log in ACCESS_LOGS_DB if log.get("user_id") == user_id]

# ============================================
# GENERAL LOG FUNCTIONS
# ============================================

def add_log(log_entry):
    """Add general log entry"""
    log_entry["timestamp"] = datetime.utcnow().isoformat()
    LOGS_DB.append(log_entry)
    return log_entry

def get_logs():
    """Get all logs"""
    return LOGS_DB

def get_logs_by_type(log_type):
    """Get logs by type"""
    return [log for log in LOGS_DB if log.get("type") == log_type]

# ============================================
# FILE FUNCTIONS (for compatibility)
# ============================================

def load_data(filename="data.json"):
    """Load data from file (returns empty dict for now)"""
    return {}

def save_data(data, filename="data.json"):
    """Save data to file (no-op for now)"""
    return True

# ============================================
# STATISTICS FUNCTIONS
# ============================================

def get_patient_count():
    """Get total patient count"""
    return len(PATIENTS_DB)

def get_access_log_count():
    """Get total access log count"""
    return len(ACCESS_LOGS_DB)

def get_logs_count():
    """Get total log count"""
    return len(LOGS_DB)

# ============================================
# DEBUG FUNCTIONS
# ============================================

def print_stats():
    """Print database statistics"""
    print(f"\n📊 DATA MANAGER STATS:")
    print(f"   Patients: {len(PATIENTS_DB)}")
    print(f"   Access Logs: {len(ACCESS_LOGS_DB)}")
    print(f"   General Logs: {len(LOGS_DB)}")
    print()

if __name__ == "__main__":
    print("📋 DATA MANAGER - In-Memory Storage")
    print("=" * 50)
    
    # Test adding patient
    patient = {
        "id": "PT-001",
        "name": "John Doe",
        "email": "john@example.com",
        "age": 45,
        "diagnosis": "Diabetes"
    }
    add_patient(patient)
    
    # Test adding access log
    log = {
        "patient_id": "PT-001",
        "user_id": "DOC-001",
        "action": "VIEW",
        "status": "SUCCESS"
    }
    add_access_log(log)
    
    print_stats()
    print(f"Patients: {get_all_patients()}")
    print(f"Access Logs: {get_access_logs()}")
