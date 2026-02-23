# static_db.py - Static/Hardcoded Database for Testing

# ============================================
# SAMPLE ADMIN ACCOUNTS
# ============================================
ADMINS = {
    "admin@ehr.com": {
        "id": "admin_001",
        "name": "Admin Manager",
        "email": "admin@ehr.com",
        "password": "Admin@123",
        "role": "admin",
        "created_at": "2024-01-01",
        "status": "active"
    },
    "superadmin@ehr.com": {
        "id": "admin_002",
        "name": "Super Admin",
        "email": "superadmin@ehr.com",
        "password": "SuperAdmin@123",
        "role": "admin",
        "created_at": "2024-01-01",
        "status": "active"
    }
}

# ============================================
# SAMPLE DOCTOR ACCOUNTS
# ============================================
DOCTORS = {
    "john.smith@hospital.com": {
        "id": "doctor_001",
        "name": "Dr. John Smith",
        "email": "john.smith@hospital.com",
        "password": "Doctor@123",
        "role": "doctor",
        "specialization": "Cardiology",
        "hospital": "Central Hospital",
        "license_number": "MD-12345",
        "phone": "+1-555-0101",
        "created_at": "2024-01-01",
        "status": "active"
    },
    "sarah.johnson@hospital.com": {
        "id": "doctor_002",
        "name": "Dr. Sarah Johnson",
        "email": "sarah.johnson@hospital.com",
        "password": "Doctor@123",
        "role": "doctor",
        "specialization": "Neurology",
        "hospital": "Central Hospital",
        "license_number": "MD-12346",
        "phone": "+1-555-0102",
        "created_at": "2024-01-01",
        "status": "active"
    },
    "michael.brown@hospital.com": {
        "id": "doctor_003",
        "name": "Dr. Michael Brown",
        "email": "michael.brown@hospital.com",
        "password": "Doctor@123",
        "role": "doctor",
        "specialization": "Orthopedics",
        "hospital": "City Medical Center",
        "license_number": "MD-12347",
        "phone": "+1-555-0103",
        "created_at": "2024-01-01",
        "status": "active"
    }
}

# ============================================
# SAMPLE NURSE ACCOUNTS
# ============================================
NURSES = {
    "emily.williams@hospital.com": {
        "id": "nurse_001",
        "name": "Emily Williams",
        "email": "emily.williams@hospital.com",
        "password": "Nurse@123",
        "role": "nurse",
        "certification": "RN",
        "department": "ICU",
        "hospital": "Central Hospital",
        "employee_id": "N-2024-001",
        "phone": "+1-555-0201",
        "created_at": "2024-01-01",
        "status": "active"
    },
    "james.davis@hospital.com": {
        "id": "nurse_002",
        "name": "James Davis",
        "email": "james.davis@hospital.com",
        "password": "Nurse@123",
        "role": "nurse",
        "certification": "RN",
        "department": "Emergency",
        "hospital": "City Medical Center",
        "employee_id": "N-2024-002",
        "phone": "+1-555-0202",
        "created_at": "2024-01-01",
        "status": "active"
    },
    "lisa.garcia@hospital.com": {
        "id": "nurse_003",
        "name": "Lisa Garcia",
        "email": "lisa.garcia@hospital.com",
        "password": "Nurse@123",
        "role": "nurse",
        "certification": "LPN",
        "department": "Ward",
        "hospital": "Central Hospital",
        "employee_id": "N-2024-003",
        "phone": "+1-555-0203",
        "created_at": "2024-01-01",
        "status": "active"
    }
}

# ============================================
# SAMPLE PATIENT ACCOUNTS
# ============================================
PATIENTS = {
    "patient1@gmail.com": {
        "id": "patient_001",
        "name": "John Doe",
        "email": "patient1@gmail.com",
        "password": "Patient@123",
        "role": "patient",
        "age": 45,
        "gender": "Male",
        "blood_type": "O+",
        "phone": "+1-555-0301",
        "address": "123 Main St, City",
        "emergency_contact": "Jane Doe (+1-555-0399)",
        "created_at": "2024-01-15",
        "status": "active"
    },
    "patient2@gmail.com": {
        "id": "patient_002",
        "name": "Jane Smith",
        "email": "patient2@gmail.com",
        "password": "Patient@123",
        "role": "patient",
        "age": 38,
        "gender": "Female",
        "blood_type": "A-",
        "phone": "+1-555-0302",
        "address": "456 Oak Ave, City",
        "emergency_contact": "John Smith (+1-555-0399)",
        "created_at": "2024-01-15",
        "status": "active"
    },
    "patient3@gmail.com": {
        "id": "patient_003",
        "name": "Robert Wilson",
        "email": "patient3@gmail.com",
        "password": "Patient@123",
        "role": "patient",
        "age": 62,
        "gender": "Male",
        "blood_type": "B+",
        "phone": "+1-555-0303",
        "address": "789 Pine Rd, City",
        "emergency_contact": "Mary Wilson (+1-555-0399)",
        "created_at": "2024-01-15",
        "status": "active"
    },
    "patient4@gmail.com": {
        "id": "patient_004",
        "name": "Maria Martinez",
        "email": "patient4@gmail.com",
        "password": "Patient@123",
        "role": "patient",
        "age": 29,
        "gender": "Female",
        "blood_type": "AB+",
        "phone": "+1-555-0304",
        "address": "321 Elm St, City",
        "emergency_contact": "Carlos Martinez (+1-555-0399)",
        "created_at": "2024-01-15",
        "status": "active"
    }
}

# ============================================
# COMBINED USER DATABASE
# ============================================
STATIC_USERS = {}
STATIC_USERS.update(ADMINS)
STATIC_USERS.update(DOCTORS)
STATIC_USERS.update(NURSES)
STATIC_USERS.update(PATIENTS)

# ============================================
# ADMIN TABLE FUNCTIONS
# ============================================

def get_admin_by_email(email):
    """Get admin by email"""
    return ADMINS.get(email.lower())

def get_all_admins():
    """Get all admins"""
    return list(ADMINS.values())

def add_admin(email, admin_data):
    """Add new admin"""
    ADMINS[email.lower()] = admin_data
    STATIC_USERS[email.lower()] = admin_data
    return True

def update_admin(email, admin_data):
    """Update admin"""
    if email.lower() in ADMINS:
        ADMINS[email.lower()].update(admin_data)
        STATIC_USERS[email.lower()].update(admin_data)
        return True
    return False

def delete_admin(email):
    """Delete admin"""
    if email.lower() in ADMINS:
        del ADMINS[email.lower()]
        del STATIC_USERS[email.lower()]
        return True
    return False

def admin_count():
    """Get count of admins"""
    return len(ADMINS)

# ============================================
# DOCTOR TABLE FUNCTIONS
# ============================================

def get_doctor_by_email(email):
    """Get doctor by email"""
    return DOCTORS.get(email.lower())

def get_all_doctors():
    """Get all doctors"""
    return list(DOCTORS.values())

def get_doctors_by_specialization(specialization):
    """Get doctors by specialization"""
    return [doc for doc in DOCTORS.values() if doc.get("specialization", "").lower() == specialization.lower()]

def get_doctors_by_hospital(hospital):
    """Get doctors by hospital"""
    return [doc for doc in DOCTORS.values() if doc.get("hospital", "").lower() == hospital.lower()]

def add_doctor(email, doctor_data):
    """Add new doctor"""
    DOCTORS[email.lower()] = doctor_data
    STATIC_USERS[email.lower()] = doctor_data
    return True

def update_doctor(email, doctor_data):
    """Update doctor"""
    if email.lower() in DOCTORS:
        DOCTORS[email.lower()].update(doctor_data)
        STATIC_USERS[email.lower()].update(doctor_data)
        return True
    return False

def delete_doctor(email):
    """Delete doctor"""
    if email.lower() in DOCTORS:
        del DOCTORS[email.lower()]
        del STATIC_USERS[email.lower()]
        return True
    return False

def doctor_count():
    """Get count of doctors"""
    return len(DOCTORS)

# ============================================
# NURSE TABLE FUNCTIONS
# ============================================

def get_nurse_by_email(email):
    """Get nurse by email"""
    return NURSES.get(email.lower())

def get_all_nurses():
    """Get all nurses"""
    return list(NURSES.values())

def get_nurses_by_department(department):
    """Get nurses by department"""
    return [nurse for nurse in NURSES.values() if nurse.get("department", "").lower() == department.lower()]

def get_nurses_by_hospital(hospital):
    """Get nurses by hospital"""
    return [nurse for nurse in NURSES.values() if nurse.get("hospital", "").lower() == hospital.lower()]

def add_nurse(email, nurse_data):
    """Add new nurse"""
    NURSES[email.lower()] = nurse_data
    STATIC_USERS[email.lower()] = nurse_data
    return True

def update_nurse(email, nurse_data):
    """Update nurse"""
    if email.lower() in NURSES:
        NURSES[email.lower()].update(nurse_data)
        STATIC_USERS[email.lower()].update(nurse_data)
        return True
    return False

def delete_nurse(email):
    """Delete nurse"""
    if email.lower() in NURSES:
        del NURSES[email.lower()]
        del STATIC_USERS[email.lower()]
        return True
    return False

def nurse_count():
    """Get count of nurses"""
    return len(NURSES)

# ============================================
# PATIENT TABLE FUNCTIONS
# ============================================

def get_patient_by_email(email):
    """Get patient by email"""
    return PATIENTS.get(email.lower())

def get_all_patients():
    """Get all patients"""
    return list(PATIENTS.values())

def get_patients_by_age_range(min_age, max_age):
    """Get patients by age range"""
    return [patient for patient in PATIENTS.values() if min_age <= patient.get("age", 0) <= max_age]

def get_patients_by_blood_type(blood_type):
    """Get patients by blood type"""
    return [patient for patient in PATIENTS.values() if patient.get("blood_type", "").upper() == blood_type.upper()]

def add_patient(email, patient_data):
    """Add new patient"""
    PATIENTS[email.lower()] = patient_data
    STATIC_USERS[email.lower()] = patient_data
    return True

def update_patient(email, patient_data):
    """Update patient"""
    if email.lower() in PATIENTS:
        PATIENTS[email.lower()].update(patient_data)
        STATIC_USERS[email.lower()].update(patient_data)
        return True
    return False

def delete_patient(email):
    """Delete patient"""
    if email.lower() in PATIENTS:
        del PATIENTS[email.lower()]
        del STATIC_USERS[email.lower()]
        return True
    return False

def patient_count():
    """Get count of patients"""
    return len(PATIENTS)

def get_patient_by_name(name):
    """Get patient by name (case-insensitive)"""
    for patient in PATIENTS.values():
        if patient.get("name", "").lower() == name.lower():
            return patient
    return None

# ============================================
# HELPER FUNCTIONS (BACKWARD COMPATIBLE)
# ============================================

def get_user_by_email(email):
    """Get user by email from any table"""
    return STATIC_USERS.get(email.lower())

def get_user_by_name_and_role(name, role):
    """Get user by name and role"""
    for email, user in STATIC_USERS.items():
        if user.get("name", "").lower() == name.lower() and user.get("role", "").lower() == role.lower():
            return user
    return None

def verify_user_credentials(email, password):
    """Verify user email and password"""
    user = get_user_by_email(email)
    if user and user.get("password") == password:
        return user
    return None

def get_users_by_role(role):
    """Get all users with specific role"""
    return [user for user in STATIC_USERS.values() if user.get("role", "").lower() == role.lower()]

def add_user(email, user_data):
    """Add new user to static database"""
    role = user_data.get("role", "").lower()
    STATIC_USERS[email.lower()] = user_data
    
    if role == "admin":
        ADMINS[email.lower()] = user_data
    elif role == "doctor":
        DOCTORS[email.lower()] = user_data
    elif role == "nurse":
        NURSES[email.lower()] = user_data
    elif role == "patient":
        PATIENTS[email.lower()] = user_data
    return True

def update_user(email, user_data):
    """Update existing user"""
    if email.lower() in STATIC_USERS:
        STATIC_USERS[email.lower()].update(user_data)
        # Also update in specific table
        role = STATIC_USERS[email.lower()].get("role", "").lower()
        if role == "admin" and email.lower() in ADMINS:
            ADMINS[email.lower()].update(user_data)
        elif role == "doctor" and email.lower() in DOCTORS:
            DOCTORS[email.lower()].update(user_data)
        elif role == "nurse" and email.lower() in NURSES:
            NURSES[email.lower()].update(user_data)
        elif role == "patient" and email.lower() in PATIENTS:
            PATIENTS[email.lower()].update(user_data)
        return True
    return False

def delete_user(email):
    """Delete user from static database"""
    if email.lower() in STATIC_USERS:
        role = STATIC_USERS[email.lower()].get("role", "").lower()
        del STATIC_USERS[email.lower()]
        
        if role == "admin" and email.lower() in ADMINS:
            del ADMINS[email.lower()]
        elif role == "doctor" and email.lower() in DOCTORS:
            del DOCTORS[email.lower()]
        elif role == "nurse" and email.lower() in NURSES:
            del NURSES[email.lower()]
        elif role == "patient" and email.lower() in PATIENTS:
            del PATIENTS[email.lower()]
        return True
    return False

def get_all_users():
    """Get all users"""
    return list(STATIC_USERS.values())

def get_database_stats():
    """Get database statistics"""
    return {
        "total_users": len(STATIC_USERS),
        "admins": admin_count(),
        "doctors": doctor_count(),
        "nurses": nurse_count(),
        "patients": patient_count(),
        "access_logs": len(ACCESS_LOGS),
        "doctor_logs": len(DOCTOR_ACCESS_LOGS),
        "nurse_logs": len(NURSE_ACCESS_LOGS)
    }

# ============================================
# LOGS STORAGE (In-Memory)
# ============================================
# ============================================
# LOGS STORAGE (In-Memory)
# ============================================
ACCESS_LOGS = [
    {
        "doctor_name": "Dr. John Smith",
        "doctor_role": "doctor",
        "action": "Normal Access (In-Network)",
        "patient_name": "john doe",
        "ip": "192.168.1.10",
        "status": "Granted",
        "timestamp": "2026-02-14 09:15:22"
    },
    {
        "doctor_name": "Dr. Sarah Johnson",
        "doctor_role": "doctor",
        "action": "Restricted Access (Outside Network)",
        "justification": "Urgent consultation required - patient critical.",
        "ai_label": "emergency",
        "ai_confidence": 0.92, 
        "patient_name": "jane smith",
        "ip": "203.0.113.45",
        "status": "Granted",
        "timestamp": "2026-02-14 10:30:15"
    },
    {  
        "doctor_name": "Unknown",
        "doctor_role": "unknown", 
        "action": "Login Attempt",
        "ip": "45.33.22.11",
        "status": "Failed",
        "timestamp": "2026-02-15 08:05:00"
    },
    {
        "doctor_name": "Emily Williams",
        "doctor_role": "nurse",
        "action": "View Patient Details",
        "patient_name": "robert wilson",
        "ip": "192.168.1.15",
        "status": "Granted",
        "timestamp": "2026-02-15 11:45:33"
    },
    {
        "doctor_name": "Dr. Michael Brown",
        "doctor_role": "doctor",
        "action": "Restricted Access (Outside Network)",
        "justification": "Just checking something.",
        "ai_label": "restricted",
        "ai_confidence": 0.45,
        "patient_name": "maria martinez",
        "ip": "198.51.100.23",
        "status": "Flagged",
        "timestamp": "2026-02-15 14:20:11"
    }
]

DOCTOR_ACCESS_LOGS = [
    {
        "doctor_name": "Dr. John Smith",
        "patient_name": "John Doe", 
        "action": "Update Patient Details",
        "status": "Success",
        "timestamp": "2026-02-14 09:20:10",
        "created_at": "2026-02-14T09:20:10.123456"
    },
    {
        "doctor_name": "Dr. Sarah Johnson",
        "patient_name": "Jane Smith",
        "action": "View Patient History",
        "status": "Success", 
        "timestamp": "2026-02-14 10:35:45",
        "created_at": "2026-02-14T10:35:45.654321"
    },
    {
        "doctor_name": "Dr. Michael Brown",
        "patient_name": "Maria Martinez",
        "action": "Update Treatment Plan",
        "status": "Success",
        "timestamp": "2026-02-15 14:25:30",
        "created_at": "2026-02-15T14:25:30.987654"
    }
]

NURSE_ACCESS_LOGS = [
    {
        "nurse_name": "Emily Williams",
        "patient_name": "Robert Wilson",
        "action": "Administer Medication", 
        "status": "Logged",
        "timestamp": "2026-02-15 08:30:00",
        "created_at": "2026-02-15T08:30:00.000000"
    },
    {
        "nurse_name": "James Davis",
        "patient_name": "Maria Martinez",
        "action": "Vitals Check",
        "status": "Logged", 
        "timestamp": "2026-02-15 09:00:00",
        "created_at": "2026-02-15T09:00:00.000000"
    },
    {
        "nurse_name": "Lisa Garcia",
        "patient_name": "John Doe",
        "action": "Patient Transfer",
        "status": "Logged",
        "timestamp": "2026-02-15 13:15:00",
        "created_at": "2026-02-15T13:15:00.000000"
    }
]

def add_access_log(log_data):
    """Add to system access logs"""
    ACCESS_LOGS.append(log_data)
    return True

def add_doctor_log(log_data):
    """Add to doctor access logs"""
    DOCTOR_ACCESS_LOGS.append(log_data)
    return True

def add_nurse_log(log_data):
    """Add to nurse access logs"""
    NURSE_ACCESS_LOGS.append(log_data)
    return True

def get_system_logs():
    """Get all system logs"""
    return ACCESS_LOGS

def get_doctor_logs():
    """Get all doctor logs"""
    return DOCTOR_ACCESS_LOGS

def get_nurse_logs():
    """Get all nurse logs"""
    return NURSE_ACCESS_LOGS

# ============================================
# TEST/QUICK REFERENCE
# ============================================
if __name__ == "__main__":
    print("🗄️  STATIC DATABASE - Separate Tables\n")
    print("=" * 70)
    
    print("\n👨‍💻 ADMINS TABLE:")
    print(f"   Count: {admin_count()}")
    for email, user in ADMINS.items():
        print(f"   📧 {email} | 🔐 {user['password']} | {user['name']}")
    
    print("\n👨‍⚕️  DOCTORS TABLE:")
    print(f"   Count: {doctor_count()}")
    for email, user in DOCTORS.items():
        spec = user.get('specialization', 'N/A')
        print(f"   📧 {email} | 🔐 {user['password']} | {user['name']} ({spec})")
    
    print("\n👩‍⚕️  NURSES TABLE:")
    print(f"   Count: {nurse_count()}")
    for email, user in NURSES.items():
        dept = user.get('department', 'N/A')
        print(f"   📧 {email} | 🔐 {user['password']} | {user['name']} ({dept})")
    
    print("\n🧑‍🤝‍🧑 PATIENTS TABLE:")
    print(f"   Count: {patient_count()}")
    for email, user in PATIENTS.items():
        age = user.get('age', 'N/A')
        print(f"   📧 {email} | 🔐 {user['password']} | {user['name']} (Age: {age})")
    
    print(f"\n\n📊 DATABASE STATISTICS:")
    stats = get_database_stats()
    print(f"   Total Users: {stats['total_users']}")
    print(f"   └─ Admins: {stats['admins']}")
    print(f"   └─ Doctors: {stats['doctors']}")
    print(f"   └─ Nurses: {stats['nurses']}")
    print(f"   └─ Patients: {stats['patients']}")
    
    print("\n" + "=" * 70)
    print("✅ QUERY EXAMPLES:")
    print("   get_all_admins() - Get all admins")
    print("   get_all_doctors() - Get all doctors")
    print("   get_all_nurses() - Get all nurses")
    print("   get_all_patients() - Get all patients")
    print("   get_doctors_by_specialization('Cardiology') - Filter doctors")
    print("   get_nurses_by_department('ICU') - Filter nurses")
    print("   get_patients_by_blood_type('O+') - Filter patients")
    print("=" * 70)

