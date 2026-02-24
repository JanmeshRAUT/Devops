// trustLogic.js — Event-driven Trust Score Engine
const config = require("./config");

// ─── Scoring Rules ────────────────────────────────────────────────────────────
const RULES = {
  // Positive behaviours
  NORMAL_ACCESS_IN_NETWORK:    +5,   // Routine access from inside hospital
  EMERGENCY_ACCESS:            -5,   // Emergency use is watched (audited)
  LOGIN:                       +2,   // Regular login activity
  TEMP_ACCESS:                 +1,   // Nurse temp access (routine)

  // Negative behaviours
  RESTRICTED_ACCESS_REQUEST:   -8,   // Unrestricted access request (outside normal scope)
  ACCESS_DENIED:               -10,  // Access attempt that was denied
  EMERGENCY_OUTSIDE_NETWORK:   -15,  // Break-glass from external IP = high risk
  REPEATED_EMERGENCY:          -10,  // Multiple break-glass events in a session

  // Caps
  MIN: 0,
  MAX: 100,
  DEFAULT: 50,                        // Starting score for new users
};

// ─── Level Labels ─────────────────────────────────────────────────────────────
function getTrustLevel(score) {
  if (score >= 85) return "🟢 Excellent";
  if (score >= 70) return "🟢 High";
  if (score >= 50) return "🟡 Moderate";
  if (score >= 30) return "🟠 Low";
  return "🔴 Critical";
}

// ─── Network Check ────────────────────────────────────────────────────────────
function isInTrustedNetwork(ip) {
  if (!ip) return false;
  const clean = ip.replace("::ffff:", ""); // strip IPv4-mapped IPv6
  return (
    clean === "127.0.0.1" ||
    clean === "::1" ||
    clean.startsWith("192.168.") ||
    clean.startsWith("10.") ||
    clean.startsWith("172.")
  );
}

// ─── Delta Calculator ─────────────────────────────────────────────────────────
/**
 * Returns the score delta for a given access log entry.
 * @param {string} action    - e.g. "NORMAL_ACCESS", "EMERGENCY_ACCESS", "LOGIN"
 * @param {string} status    - e.g. "Granted", "Denied", "Success", "Emergency"
 * @param {string} ip        - requester IP
 * @param {number} recentEmergencyCount - how many emergency events in last 24h
 */
function getDelta(action, status, ip, recentEmergencyCount = 0) {
  const act = (action || "").toUpperCase();
  const sta = (status  || "").toLowerCase();
  const inNetwork = isInTrustedNetwork(ip);

  // Denied access — biggest penalty
  if (sta.includes("denied") || sta.includes("deny")) {
    return RULES.ACCESS_DENIED;
  }

  // Emergency / Break-Glass
  if (act.includes("EMERGENCY")) {
    let delta = RULES.EMERGENCY_ACCESS;
    if (!inNetwork)                     delta += RULES.EMERGENCY_OUTSIDE_NETWORK;
    if (recentEmergencyCount >= 2)      delta += RULES.REPEATED_EMERGENCY;
    return delta;
  }

  // Restricted / Unrestricted (pending admin approval)
  if (act.includes("RESTRICTED")) {
    return RULES.RESTRICTED_ACCESS_REQUEST;
  }

  // Normal in-network access
  if (act.includes("NORMAL")) {
    return inNetwork ? RULES.NORMAL_ACCESS_IN_NETWORK : 0;
  }

  // Temp access (nurse)
  if (act.includes("TEMP")) {
    return RULES.TEMP_ACCESS;
  }

  // Login
  if (act.includes("LOGIN")) {
    return RULES.LOGIN;
  }

  return 0; // Unknown action — no change
}

// ─── Recalculate & Persist ────────────────────────────────────────────────────
/**
 * Recalculate trust score for a user based on their last N access logs,
 * then persist it in the users table.
 *
 * @param {string} doctorName
 * @param {object} db  - { get, run, all } from database.js
 */
async function recalculateTrustScore(doctorName, db) {
  try {
    const { get, run, all } = db;

    // Fetch last 20 access log entries for this user
    const logs = await all(
      `SELECT action, status, ip, timestamp FROM access_logs
       WHERE (name = ? OR doctor_name = ?)
       ORDER BY timestamp DESC
       LIMIT 20`,
      [doctorName, doctorName]
    );

    // Count emergency events in last 24 hours
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentEmergencies = logs.filter(
      (l) =>
        l.action?.toUpperCase().includes("EMERGENCY") &&
        l.timestamp >= since24h
    ).length;

    // Start from current score (or default) and apply deltas
    const user = await get(
      "SELECT trustScore FROM users WHERE LOWER(name) = LOWER(?) LIMIT 1",
      [doctorName]
    );

    // Use rolling recalculation from DEFAULT rather than accumulating forever
    let score = RULES.DEFAULT;
    for (const log of [...logs].reverse()) {            // oldest → newest
      const delta = getDelta(log.action, log.status, log.ip, recentEmergencies);
      score = Math.min(RULES.MAX, Math.max(RULES.MIN, score + delta));
    }

    // Persist updated score
    await run(
      "UPDATE users SET trustScore = ?, updatedAt = ? WHERE LOWER(name) = LOWER(?)",
      [score, new Date().toISOString(), doctorName]
    );

    console.log(`🔄 Trust score recalculated for ${doctorName}: ${user?.trustScore ?? RULES.DEFAULT} → ${score} (${getTrustLevel(score)})`);
    return score;
  } catch (err) {
    console.error("Trust score recalculation error:", err.message);
    return null;
  }
}

// ─── Legacy helper (kept for backward compat) ─────────────────────────────────
function shouldGrantAccess(trustScore) {
  return trustScore >= config.TRUST_THRESHOLD;
}

function calculateTrustScore(request, user, patient) {
  // Legacy stub — access routes now use recalculateTrustScore instead
  return RULES.DEFAULT;
}

module.exports = {
  calculateTrustScore,
  recalculateTrustScore,
  isInTrustedNetwork,
  shouldGrantAccess,
  getTrustLevel,
  getDelta,
  RULES,
};
