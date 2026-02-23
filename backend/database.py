"""
Database connection and session management for PostgreSQL
Replaces Firebase with SQLAlchemy ORM
"""

from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker, Session
from config import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME
from models import Base, User, Patient, AccessLog, AuditLog, TrustScore, AccessPermission, EmergencyAccess
from datetime import datetime
from urllib.parse import quote_plus

# Build connection string properly handling passwords
if DB_PASSWORD:
    DATABASE_URL = f"postgresql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    DATABASE_URL = f"postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"📊 Database URL: postgresql://{DB_USER}:****@{DB_HOST}:{DB_PORT}/{DB_NAME}")
from typing import Optional, List, Dict

# Create database engine
engine = create_engine(DATABASE_URL, echo=False)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency for getting DB session (for Flask routes)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")


# ============================================
# USER FUNCTIONS (replaces static_db user functions)
# ============================================

def create_user(db: Session, user_data: Dict) -> User:
    """Create a new user"""
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session, role: Optional[str] = None) -> List[User]:
    """Get all users, optionally filtered by role"""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()


def update_user(db: Session, user_id: str, user_data: Dict) -> Optional[User]:
    """Update user information"""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        for key, value in user_data.items():
            setattr(user, key, value)
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
    return user


def delete_user(db: Session, user_id: str) -> bool:
    """Delete user"""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False


def verify_user_credentials(db: Session, email: str, password: str) -> Optional[User]:
    """Verify user credentials"""
    user = get_user_by_email(db, email)
    if user and user.password == password:
        return user
    return None


def get_user_by_name_and_role(db: Session, name: str, role: str) -> Optional[User]:
    """Get user by name and role"""
    return db.query(User).filter(
        and_(User.name == name, User.role == role)
    ).first()


# ============================================
# PATIENT FUNCTIONS (replaces data_manager patient functions)
# ============================================

def create_patient(db: Session, patient_data: Dict) -> Patient:
    """Create a new patient"""
    patient = Patient(**patient_data)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def get_patient_by_id(db: Session, patient_id: str) -> Optional[Patient]:
    """Get patient by ID"""
    return db.query(Patient).filter(Patient.id == patient_id).first()


def get_patient_by_email(db: Session, email: str) -> Optional[Patient]:
    """Get patient by email"""
    return db.query(Patient).filter(Patient.email == email).first()


def get_patient_by_name(db: Session, name: str) -> Optional[Patient]:
    """Get patient by name"""
    return db.query(Patient).filter(Patient.name == name).first()


def get_all_patients(db: Session) -> List[Patient]:
    """Get all patients"""
    return db.query(Patient).filter(Patient.status == "active").all()


def update_patient(db: Session, patient_id: str, patient_data: Dict) -> Optional[Patient]:
    """Update patient information"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient:
        for key, value in patient_data.items():
            setattr(patient, key, value)
        patient.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(patient)
    return patient


def delete_patient(db: Session, patient_id: str) -> bool:
    """Delete patient (soft delete via status)"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient:
        patient.status = "inactive"
        patient.updated_at = datetime.utcnow()
        db.commit()
        return True
    return False


# ============================================
# ACCESS LOG FUNCTIONS (replaces data_manager log functions)
# ============================================

def create_access_log(db: Session, log_data: Dict) -> AccessLog:
    """Create an access log entry"""
    log_entry = AccessLog(**log_data)
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def get_access_logs(db: Session) -> List[AccessLog]:
    """Get all access logs"""
    return db.query(AccessLog).order_by(AccessLog.timestamp.desc()).all()


def get_access_logs_by_patient(db: Session, patient_id: str) -> List[AccessLog]:
    """Get access logs for a specific patient"""
    return db.query(AccessLog).filter(
        AccessLog.patient_id == patient_id
    ).order_by(AccessLog.timestamp.desc()).all()


def get_access_logs_by_user(db: Session, user_id: str) -> List[AccessLog]:
    """Get access logs by user"""
    return db.query(AccessLog).filter(
        AccessLog.user_id == user_id
    ).order_by(AccessLog.timestamp.desc()).all()


def get_access_logs_by_patient_and_user(db: Session, patient_id: str, user_id: str) -> List[AccessLog]:
    """Get access logs for specific patient and user"""
    return db.query(AccessLog).filter(
        and_(AccessLog.patient_id == patient_id, AccessLog.user_id == user_id)
    ).order_by(AccessLog.timestamp.desc()).all()


# ============================================
# AUDIT LOG FUNCTIONS (replaces general logs)
# ============================================

def create_audit_log(db: Session, log_data: Dict) -> AuditLog:
    """Create an audit log entry"""
    log_entry = AuditLog(**log_data)
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def get_audit_logs(db: Session) -> List[AuditLog]:
    """Get all audit logs"""
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()


def get_audit_logs_by_type(db: Session, entity_type: str) -> List[AuditLog]:
    """Get audit logs by entity type"""
    return db.query(AuditLog).filter(
        AuditLog.entity_type == entity_type
    ).order_by(AuditLog.timestamp.desc()).all()


# ============================================
# TRUST SCORE FUNCTIONS
# ============================================

def create_trust_score(db: Session, user_id: str, patient_id: str, score: float = 50.0) -> TrustScore:
    """Create a trust score entry"""
    trust_score = TrustScore(user_id=user_id, patient_id=patient_id, score=score)
    db.add(trust_score)
    db.commit()
    db.refresh(trust_score)
    return trust_score


def get_trust_score(db: Session, user_id: str, patient_id: str) -> Optional[TrustScore]:
    """Get trust score for user-patient pair"""
    return db.query(TrustScore).filter(
        and_(TrustScore.user_id == user_id, TrustScore.patient_id == patient_id)
    ).first()


def update_trust_score(db: Session, user_id: str, patient_id: str, score: float, factors: Dict = None) -> TrustScore:
    """Update trust score"""
    trust_score = get_trust_score(db, user_id, patient_id)
    if not trust_score:
        trust_score = create_trust_score(db, user_id, patient_id, score)
    else:
        trust_score.score = score
        trust_score.factors = factors
        trust_score.last_updated = datetime.utcnow()
        db.commit()
        db.refresh(trust_score)
    return trust_score


# ============================================
# ACCESS PERMISSION FUNCTIONS
# ============================================

def create_access_permission(db: Session, user_id: str, patient_id: str, permission_type: str, expires_at=None) -> AccessPermission:
    """Create an access permission"""
    permission = AccessPermission(
        user_id=user_id,
        patient_id=patient_id,
        permission_type=permission_type,
        expires_at=expires_at
    )
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission


def get_access_permission(db: Session, user_id: str, patient_id: str) -> Optional[AccessPermission]:
    """Get access permission for user-patient pair"""
    return db.query(AccessPermission).filter(
        and_(
            AccessPermission.user_id == user_id,
            AccessPermission.patient_id == patient_id,
            AccessPermission.is_active == True
        )
    ).first()


def revoke_access_permission(db: Session, user_id: str, patient_id: str) -> bool:
    """Revoke access permission"""
    permission = get_access_permission(db, user_id, patient_id)
    if permission:
        permission.is_active = False
        db.commit()
        return True
    return False


# ============================================
# EMERGENCY ACCESS FUNCTIONS
# ============================================

def create_emergency_access(db: Session, access_data: Dict) -> EmergencyAccess:
    """Create emergency access request"""
    emergency = EmergencyAccess(**access_data)
    db.add(emergency)
    db.commit()
    db.refresh(emergency)
    return emergency


def get_emergency_access(db: Session, user_id: str, patient_id: str) -> Optional[EmergencyAccess]:
    """Get active emergency access"""
    return db.query(EmergencyAccess).filter(
        and_(
            EmergencyAccess.user_id == user_id,
            EmergencyAccess.patient_id == patient_id,
            EmergencyAccess.approved == True,
            EmergencyAccess.revoked_at == None
        )
    ).first()


def revoke_emergency_access(db: Session, access_id: int, reason: str) -> bool:
    """Revoke emergency access"""
    emergency = db.query(EmergencyAccess).filter(EmergencyAccess.id == access_id).first()
    if emergency:
        emergency.revoked_at = datetime.utcnow()
        emergency.revoked_reason = reason
        db.commit()
        return True
    return False


# ============================================
# STATISTICS FUNCTIONS
# ============================================

def get_database_stats(db: Session) -> Dict:
    """Get database statistics"""
    return {
        "total_users": db.query(User).count(),
        "total_patients": db.query(Patient).filter(Patient.status == "active").count(),
        "total_access_logs": db.query(AccessLog).count(),
        "total_audit_logs": db.query(AuditLog).count(),
        "total_access_permissions": db.query(AccessPermission).filter(AccessPermission.is_active == True).count(),
        "total_emergency_accesses": db.query(EmergencyAccess).filter(
            and_(EmergencyAccess.approved == True, EmergencyAccess.revoked_at == None)
        ).count()
    }
