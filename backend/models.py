"""
SQLAlchemy database models for EMS Access Control System
Replaces static_db.py and data_manager.py with PostgreSQL persistence
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, JSON, func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from config import DATABASE_URL

Base = declarative_base()


class User(Base):
    """Base User model for all user types (Doctor, Nurse, Admin, Patient)"""
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True)  # admin, doctor, nurse, patient
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Doctor-specific fields
    specialization = Column(String(100), nullable=True)
    hospital = Column(String(100), nullable=True)
    license_number = Column(String(50), nullable=True)
    
    # Nurse-specific fields
    certification = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    employee_id = Column(String(50), nullable=True)
    
    # Patient-specific fields
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_type = Column(String(10), nullable=True)
    emergency_contact = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)
    
    # Common fields
    phone = Column(String(20), nullable=True)


class Patient(Base):
    """Patient record with medical information"""
    __tablename__ = "patients"
    
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=False)  # Reference to User
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    age = Column(Integer)
    gender = Column(String(20))
    blood_type = Column(String(10))
    phone = Column(String(20))
    address = Column(Text)
    emergency_contact = Column(String(200))
    diagnosis = Column(Text)
    medications = Column(JSON)  # List of medications
    allergies = Column(JSON)  # List of allergies
    medical_history = Column(Text)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AccessPermission(Base):
    """Access permissions for users to access patient data"""
    __tablename__ = "access_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=False)
    patient_id = Column(String(50), index=True, nullable=False)
    permission_type = Column(String(50), nullable=False)  # VIEW, EDIT, EMERGENCY
    granted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    granted_by = Column(String(50), nullable=True)


class AccessLog(Base):
    """Log of all access attempts to patient data"""
    __tablename__ = "access_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=False)
    patient_id = Column(String(50), index=True, nullable=False)
    action = Column(String(50), nullable=False)  # VIEW, EDIT, DELETE
    status = Column(String(20), nullable=False)  # SUCCESS, FAILED, BLOCKED
    reason = Column(Text, nullable=True)
    trust_score = Column(Float, nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # For emergency access
    is_emergency = Column(Boolean, default=False)
    justification = Column(Text, nullable=True)


class AuditLog(Base):
    """General audit logs for system events"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)  # User, Patient, Access, etc.
    entity_id = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    status = Column(String(20), default="success")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class TrustScore(Base):
    """Trust score tracking for users"""
    __tablename__ = "trust_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=False)
    patient_id = Column(String(50), index=True, nullable=False)
    score = Column(Float, default=50.0)
    factors = Column(JSON, nullable=True)  # Trust calculation factors
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by_system = Column(Boolean, default=True)


class EmergencyAccess(Base):
    """Track emergency access events"""
    __tablename__ = "emergency_access"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=False)
    patient_id = Column(String(50), index=True, nullable=False)
    reason = Column(String(100), nullable=False)
    justification = Column(Text, nullable=False)
    approved = Column(Boolean, default=False)
    approved_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    revoked_reason = Column(Text, nullable=True)
