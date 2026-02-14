// encryption.js
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-256-bit-key-here-must-be-32-chars";

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
  try {
    if (!text) return null;
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("❌ Encryption error:", error.message);
    return null;
  }
}

/**
 * Decrypt sensitive data
 */
function decrypt(encryptedText) {
  try {
    if (!encryptedText) return null;
    
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("❌ Decryption error:", error.message);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt
};
