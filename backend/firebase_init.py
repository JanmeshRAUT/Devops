
from database import SessionLocal, init_db, create_user, create_patient
import uuid
from datetime import timedelta, datetime

init_db()

def load_sample_data():