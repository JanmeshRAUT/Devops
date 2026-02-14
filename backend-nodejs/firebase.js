// firebase.js
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const config = require("./config");

let firebaseInitialized = false;
let db = null;
let auth = null;

try {
  // Load Firebase config
  const configPath = config.FIREBASE_CONFIG_PATH;
  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️ Firebase config not found at ${configPath}`);
  } else {
    const serviceAccount = require(path.resolve(configPath));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: serviceAccount.database_url
    });
    
    db = admin.firestore();
    auth = admin.auth();
    firebaseInitialized = true;
    console.log("✅ Firebase initialized successfully");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message);
}

module.exports = {
  db,
  auth,
  firebaseInitialized,
  admin
};
