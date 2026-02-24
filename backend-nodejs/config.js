// config.js
module.exports = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@ehr.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin@123",
  TRUSTED_NETWORK: process.env.TRUSTED_NETWORK || "192.168.1.0/24",
  TRUST_THRESHOLD: parseInt(process.env.TRUST_THRESHOLD) || 40,
  
  SMTP_SERVER: process.env.SMTP_SERVER || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  EMAIL_SENDER: process.env.EMAIL_SENDER || "janmeshraut.mitadt@gmail.com",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  
  // SQLite
  DATABASE_PATH: process.env.DATABASE_PATH || "./ehr.db",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  
  PORT: parseInt(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development"
};
