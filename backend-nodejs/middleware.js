// middleware.js
const { verifyToken } = require("./utils");
const { auth, firebaseInitialized } = require("./firebase");

/**
 * Verify Firebase ID token
 */
async function verifyFirebaseToken(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "❌ Missing authorization token" });
  }
  
  try {
    if (!firebaseInitialized) {
      return res.status(500).json({ error: "❌ Firebase not initialized" });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    res.status(401).json({ error: "❌ Invalid or expired token" });
  }
}

/**
 * Verify JWT token
 */
async function verifyJWTToken(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "❌ Missing authorization token" });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "❌ Invalid or expired token" });
  }
  
  req.user = decoded;
  next();
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err.message);
  
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: "❌ Too many requests. Please try again later.",
      message: err.message
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
}

/**
 * CORS error handler
 */
function handleCorsError(err, req, res, next) {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "❌ CORS error: Origin not allowed"
    });
  }
  next(err);
}

/**
 * Request logger middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
}

module.exports = {
  verifyFirebaseToken,
  verifyJWTToken,
  errorHandler,
  handleCorsError,
  requestLogger
};
