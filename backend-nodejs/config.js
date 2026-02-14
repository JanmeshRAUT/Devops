// config.js
module.exports = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@ehr.com",
  TRUSTED_NETWORK: process.env.TRUSTED_NETWORK || "192.168.1.0/24",
  TRUST_THRESHOLD: parseInt(process.env.TRUST_THRESHOLD) || 40,
  
  SMTP_SERVER: process.env.SMTP_SERVER || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  EMAIL_SENDER: process.env.EMAIL_SENDER || "janmeshraut.mitadt@gmail.com",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  
  FIREBASE_CONFIG_PATH: process.env.FIREBASE_CONFIG_PATH || "./firebase_config.json",
  
  PORT: parseInt(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development"
};
