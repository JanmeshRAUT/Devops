// trustLogic.js
const config = require("./config");

/**
 * Calculate trust score for access request
 */
function calculateTrustScore(request, user, patient) {
  let score = 0;
  
  // Base trust level
  if (request.requesterId === patient.assignedDoctor) {
    score += 40; // Primary doctor
  }
  
  // Role-based trust
  if (user.role === "doctor") {
    score += 20;
  } else if (user.role === "nurse") {
    score += 15;
  }
  
  // Check if requester is in trusted network
  if (isInTrustedNetwork(request.requesterIp)) {
    score += 15;
  }
  
  // Request purpose
  if (request.reason && request.reason.toLowerCase().includes("emergency")) {
    score += 25;
  }
  
  // History-based trust
  if (request.requesterAccessCount > 10) {
    score += 10;
  }
  
  return Math.min(score, 100); // Cap at 100
}

/**
 * Check if IP is in trusted network
 */
function isInTrustedNetwork(ip) {
  // Simple check - can be extended
  return ip && ip.startsWith(config.TRUSTED_NETWORK.split("/")[0]);
}

/**
 * Should grant access based on trust score
 */
function shouldGrantAccess(trustScore) {
  return trustScore >= config.TRUST_THRESHOLD;
}

/**
 * Get trust level description
 */
function getTrustLevel(score) {
  if (score >= 80) return "🟢 Very High";
  if (score >= 60) return "🟡 High";
  if (score >= 40) return "🟠 Medium";
  if (score >= 20) return "🔴 Low";
  return "❌ Very Low";
}

module.exports = {
  calculateTrustScore,
  isInTrustedNetwork,
  shouldGrantAccess,
  getTrustLevel
};
