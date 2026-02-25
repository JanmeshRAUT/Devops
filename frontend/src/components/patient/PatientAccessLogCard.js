import React from 'react';
import { FaUserMd, FaClock, FaNotesMedical, FaFileAlt, FaCheckCircle, FaTimesCircle, FaCircle, FaFlag } from 'react-icons/fa';

const PatientAccessLogCard = ({ log, onReport }) => {
  const getStatusIcon = (status) => {
    if (status.includes("Grant") || status.includes("Approve") || status.includes("Success")) {
      return <FaCheckCircle className="status-icon granted-icon" />;
    } else if (status.includes("Deny") || status.includes("Flag") || status.includes("Denied")) {
      return <FaTimesCircle className="status-icon denied-icon" />;
    }
    return <FaCircle className="status-icon pending-icon" />;
  };

  const getAccessTypeBadge = (accessType) => {
    if (accessType.includes("Emergency")) return "emergency";
    if (accessType.includes("Normal")) return "normal";
    if (accessType.includes("Restricted")) return "restricted";
    if (accessType.includes("Temporary")) return "temporary";
    return "default";
  };

  return (
    <div className="access-log-card">
      <div className="log-card-header">
        <div className="log-user-info">
          <div className="user-avatar">
            <FaUserMd />
          </div>
          <div>
            <h3 className="log-doctor-name">{log.doctor}</h3>
            <span className="log-role">{log.role}</span>
          </div>
        </div>
        <div className={`access-badge ${getAccessTypeBadge(log.accessType)}`}>
          {log.accessType.replace("Access", "").trim() || "Data Access"}
        </div>
      </div>

      <div className="log-card-body">
        <div className="log-item">
          <div className="log-item-label">
            <span className="log-icon">{getStatusIcon(log.status)}</span>
            <span>Status</span>
          </div>
          <div className={`log-item-value status-${
            log.status.includes("Grant") || log.status.includes("Approve") || log.status.includes("Success") ? "approved" 
            : log.status.includes("Deny") || log.status.includes("Flag") || log.status.includes("Denied") ? "denied" 
            : "pending"
          }`}>
            {log.status}
          </div>
        </div>

        <div className="log-item">
          <div className="log-item-label">
            <span className="log-icon"><FaFileAlt /></span>
            <span>Access Type</span>
          </div>
          <div className="log-item-value">{log.accessType}</div>
        </div>

        {log.justification && log.justification !== "Routine Checkup" && (
          <div className="log-item">
            <div className="log-item-label">
              <span className="log-icon"><FaNotesMedical /></span>
              <span>Reason</span>
            </div>
            <div className="log-item-value justification-text">
              "{log.justification}"
            </div>
          </div>
        )}

        <div className="log-item">
          <div className="log-item-label">
            <span className="log-icon"><FaClock /></span>
            <span>Time</span>
          </div>
          <div className="log-item-value timestamp">
            {new Date(log.timestamp).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </div>
        </div>
      </div>

      <div className="log-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="source-badge">{log.source === "doctor" ? "📋 Doctor Log" : "🔐 System Log"}</span>
        {onReport && log.status !== "Flagged" && log.status !== "Denied" && (
          <button 
            className="report-btn" 
            onClick={() => onReport(log.id, log.doctor)}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '4px', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
            title="Report this access as suspicious"
          >
            <FaFlag /> Report
          </button>
        )}
        {log.status === "Flagged" && (
          <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaFlag /> Reported
          </span>
        )}
      </div>
    </div>
  );
};

export default PatientAccessLogCard;
