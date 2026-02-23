import os
from urllib.parse import quote_plus

ADMIN_EMAIL = "admin@ehr.com"
TRUSTED_NETWORK = "192.168.1.0/24"
TRUST_THRESHOLD = 40

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_SENDER = "janmeshraut.mitadt@gmail.com"
EMAIL_PASSWORD = "njvx xusb hbzy naaf"

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "ems_access_control")

DATABASE_URL = f"postgresql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"