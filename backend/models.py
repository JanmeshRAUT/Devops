from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, JSON, func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from config import DATABASE_URL

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    specialization = Column(String(100), nullable=True)
    hospital = Column(String(100), nullable=True)
    license_number = Column(String(50), nullable=True)

    certification = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    employee_id = Column(String(50), nullable=True)

    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_type = Column(String(10), nullable=True)
    emergency_contact = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)

    phone = Column(String(20), nullable=True)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    age = Column(Integer)
    gender = Column(String(20))
    blood_type = Column(String(10))
    phone = Column(String(20))
    address = Column(Text)
    emergency_contact = Column(String(200))
    diagnosis = Column(Text)
    medications = Column(JSON)
    allergies = Column(JSON)
    medical_history = Column(Text)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AccessPermission(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=False)
    patient_id = Column(String(50), index=True, nullable=False)
    action = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)
    reason = Column(Text, nullable=True)
    trust_score = Column(Float, nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    is_emergency = Column(Boolean, default=False)
    justification = Column(Text, nullable=True)

class AuditLog(Base):
    __tablename__ = "trust_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=False)
    patient_id = Column(String(50), index=True, nullable=False)
    score = Column(Float, default=50.0)
    factors = Column(JSON, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by_system = Column(Boolean, default=True)

class EmergencyAccess(Base):