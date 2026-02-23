
from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker, Session
from config import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME
from models import Base, User, Patient, AccessLog, AuditLog, TrustScore, AccessPermission, EmergencyAccess
from datetime import datetime
from urllib.parse import quote_plus

if DB_PASSWORD:
    DATABASE_URL = f"postgresql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    DATABASE_URL = f"postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"📊 Database URL: postgresql://{DB_USER}:****@{DB_HOST}:{DB_PORT}/{DB_NAME}")
from typing import Optional, List, Dict

engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

def create_user(db: Session, user_data: Dict) -> User:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()

def update_user(db: Session, user_id: str, user_data: Dict) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

def verify_user_credentials(db: Session, email: str, password: str) -> Optional[User]:
    return db.query(User).filter(
        and_(User.name == name, User.role == role)
    ).first()

def create_patient(db: Session, patient_data: Dict) -> Patient:
    return db.query(Patient).filter(Patient.id == patient_id).first()

def get_patient_by_email(db: Session, email: str) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.name == name).first()

def get_all_patients(db: Session) -> List[Patient]:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient:
        for key, value in patient_data.items():
            setattr(patient, key, value)
        patient.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(patient)
    return patient

def delete_patient(db: Session, patient_id: str) -> bool:
    log_entry = AccessLog(**log_data)
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

def get_access_logs(db: Session) -> List[AccessLog]:
    return db.query(AccessLog).filter(
        AccessLog.patient_id == patient_id
    ).order_by(AccessLog.timestamp.desc()).all()

def get_access_logs_by_user(db: Session, user_id: str) -> List[AccessLog]:
    return db.query(AccessLog).filter(
        and_(AccessLog.patient_id == patient_id, AccessLog.user_id == user_id)
    ).order_by(AccessLog.timestamp.desc()).all()

def create_audit_log(db: Session, log_data: Dict) -> AuditLog:
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()

def get_audit_logs_by_type(db: Session, entity_type: str) -> List[AuditLog]:
    trust_score = TrustScore(user_id=user_id, patient_id=patient_id, score=score)
    db.add(trust_score)
    db.commit()
    db.refresh(trust_score)
    return trust_score

def get_trust_score(db: Session, user_id: str, patient_id: str) -> Optional[TrustScore]:
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

def create_access_permission(db: Session, user_id: str, patient_id: str, permission_type: str, expires_at=None) -> AccessPermission:
    return db.query(AccessPermission).filter(
        and_(
            AccessPermission.user_id == user_id,
            AccessPermission.patient_id == patient_id,
            AccessPermission.is_active == True
        )
    ).first()

def revoke_access_permission(db: Session, user_id: str, patient_id: str) -> bool:
    emergency = EmergencyAccess(**access_data)
    db.add(emergency)
    db.commit()
    db.refresh(emergency)
    return emergency

def get_emergency_access(db: Session, user_id: str, patient_id: str) -> Optional[EmergencyAccess]:
    emergency = db.query(EmergencyAccess).filter(EmergencyAccess.id == access_id).first()
    if emergency:
        emergency.revoked_at = datetime.utcnow()
        emergency.revoked_reason = reason
        db.commit()
        return True
    return False

def get_database_stats(db: Session) -> Dict: