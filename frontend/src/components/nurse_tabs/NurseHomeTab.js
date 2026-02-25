import React, { useState, useMemo, useRef, useEffect } from 'react';
import { API_URL } from '../../api';
import { 
  FaUserInjured, 
  FaSearch, 
  FaCheckCircle, 
  FaTimes, 
  FaClipboardList, 
  FaNetworkWired,
  FaUserClock,
  FaNotesMedical
} from 'react-icons/fa';
import "../../css/NurseHomeTab.css";
import "../../css/DashboardStats.css"; // Shared Stats CSS
import "../../css/Skeleton.css"; // Skeleton Loading
import TrustScoreMeter from '../TrustScoreMeter';

const NurseHomeTab = ({
  trustScore,
  patients,
  selectedPatient,
  selectedPatientData,
  handleSelectPatient,
  isInsideNetwork,
  handleAccessRequest,
  accessGranted,
  accessExpiryTime,
  logs,
  setActiveTab
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const [emergencyReason, setEmergencyReason] = useState('');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [restrictedReason, setRestrictedReason] = useState('');
  const [checkStatus, setCheckStatus] = useState({ message: "", color: "#94a3b8" });
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!emergencyReason.trim()) {
        setCheckStatus({ message: "", color: "#94a3b8" });
        return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setCheckStatus({ message: "Checking...", color: "#64748b" });

    debounceRef.current = setTimeout(async () => {
        try {
            const res = await fetch(`${API_URL}/api/access/precheck`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ justification: emergencyReason })
            });
            const data = await res.json();
            
            if (data.status === "valid") {
                setCheckStatus({ message: data.message, color: "#16a34a" });
            } else if (data.status === "weak") {
                setCheckStatus({ message: data.message, color: "#ca8a04" });
            } else {
                setCheckStatus({ message: data.message, color: "#dc2626" });
            }
        } catch (err) {
            setCheckStatus({ message: "Offline check unavailable", color: "#94a3b8" });
        }
    }, 600);
  }, [emergencyReason]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    // If no search term, show first 20 patients (browse mode)
    if (!searchTerm.trim()) {
      return patients.slice(0, 20);
    }
    return patients.filter(p => {
      const name = (p.name || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || email.includes(term);
    }).slice(0, 20); // Limit results
  }, [patients, searchTerm]);

  // Sync search term with selected patient when it changes externally
  useEffect(() => {
    if (selectedPatient) {
        setSearchTerm(selectedPatient);
    }
  }, [selectedPatient]);

  const onSelect = (name) => {
    setSearchTerm(name);
    handleSelectPatient(name);
    setIsSearchOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    handleSelectPatient("");
    setIsSearchOpen(false);
  };

  // Recent logs for left panel
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="dashboard-grid"> {/* Uses same layout grid as Doctor */}
      
      {/* ============== LEFT COLUMN: TRUST & ACTIVITY ============== */}
      <div className="trust-panel">
         <section className="ehr-section trust-panel-content">
            <h2>🛡️ Trust Score</h2>
            
            {/* Meter Section */}
            <div className="meter-section">
                <TrustScoreMeter score={trustScore} />
            </div>

            {/* Recent Activity Section */}
            <div className="activity-section">
                <h3 className="activity-heading">Your Recent Activity</h3>
                <div className="activity-list">
                    {recentLogs.map((log, i) => (
                        <div key={i} className="activity-item">
                            <div className={`activity-indicator ${log.status === 'Success' || log.status === 'Granted' ? 'success' : 'error'}`}></div>
                            <div className="activity-item-content">
                                <div className="activity-action">{log.action}</div>
                                {log.patient_name !== "N/A" && <div className="activity-meta">Patient: {log.patient_name}</div>}
                                <div className="activity-time">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                        </div>
                    ))}
                    {recentLogs.length === 0 && <p className="activity-empty">No recent activity.</p>}
                </div>
                <button 
                  onClick={() => setActiveTab("accessLogs")} 
                  className="btn-view-all"
                >
                  View Full Logs →
                </button>
            </div>
         </section>
      </div>

      {/* ============== RIGHT COLUMN: MAIN CONTENT ============== */}
      <div className={`dashboard-main-content ${accessGranted ? 'scrollable' : ''}`}>
         
         {/* 0. QUICK STATS ROW */}
         <div className="stats-grid-row">
            <div className={`stat-card ${isInsideNetwork ? "stat-green" : "stat-orange"}`}>
                <div className="stat-icon-wrapper"><FaNetworkWired /></div>
                <div className="stat-content">
                    <div className="stat-value">{isInsideNetwork ? "Secure" : "External"}</div>
                    <div className="stat-label">Network Status</div>
                </div>
            </div>
            <div className="stat-card stat-blue">
                <div className="stat-icon-wrapper"><FaUserClock /></div>
                <div className="stat-content">
                    <div className="stat-value">{logs.filter(l => l.status === 'Granted' || l.status === 'Success').length}</div>
                    <div className="stat-label">Access Granted</div>
                </div>
            </div>
            <div className="stat-card stat-purple">
                <div className="stat-icon-wrapper"><FaNotesMedical /></div>
                <div className="stat-content">
                    <div className="stat-value">{selectedPatient ? 1 : 0}</div>
                    <div className="stat-label">Active Patient</div>
                </div>
            </div>
         </div>

         {/* 1. PATIENT LOOKUP & ACTION PANEL */}
         <div className="patient-panel">
            <section className="ehr-section toolbar-section">
                <div className="toolbar-header-row">
                    <h2 className="toolbar-title"><FaSearch /> Patient Lookup</h2>
                    <div className="toolbar-side-actions">
                         {/* Optional extra actions */}
                    </div>
                </div>

                <div className="patient-toolbar-content">
                    <div className="search-field-wrapper" ref={searchRef}>
                        <FaSearch className="field-icon" />
                        <input
                           type="text"
                           className="patient-input-pro"
                           placeholder="Search patient by Name or Email..."
                           value={searchTerm}
                           onChange={(e) => {
                               setSearchTerm(e.target.value);
                               setIsSearchOpen(true);
                           }}
                           onFocus={() => setIsSearchOpen(true)}
                        />
                        {searchTerm && (
                            <button className="clear-search-btn" onClick={handleClear}>
                                <FaTimes />
                            </button>
                        )}

                        {/* Dropdown */}
                        {isSearchOpen && (searchTerm || filteredPatients.length > 0) && (
                            <div className="search-results-dropdown">
                                {filteredPatients.length > 0 ? filteredPatients.map((p, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`result-item ${selectedPatient === p.name ? 'active' : ''}`}
                                      onClick={() => onSelect(p.name)}
                                    >
                                        <div className="result-avatar">{p.name.charAt(0)}</div>
                                        <div className="result-info">
                                            <span className="result-name">{p.name}</span>
                                            <span className="result-email">{p.email}</span>
                                        </div>
                                    </div>
                                )) : (
                                   <div className="result-item" style={{cursor: 'default', color: '#94a3b8'}}>
                                      No patients found.
                                   </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
         </div>

         {/* 2. ACCESS CARDS (CONDITIONAL) */}
         {selectedPatient && (
             <div className="access-panel fade-in-up">
                 {!accessGranted ? (
                    /* REQUEST CARD */
                     <section className="ehr-section">
                        <h2>🔐 Request Access</h2>

                        <div className="ehr-access-grid">
                          {/* Normal — in-network only */}
                          <div className={`ehr-access-card green ${!isInsideNetwork ? "disabled-card" : ""}`}>
                            <div className="card-icon">🏥</div>
                            <h3>Temporary Access</h3>
                            <p>Routine care access format (30 mins). Available <strong>only within hospital Wi-Fi</strong>. No justification required.</p>
                            <button
                              className="btn btn-green btn-block"
                              onClick={() => handleAccessRequest("request_temp")}
                              disabled={!isInsideNetwork}
                            >
                              Request Temp Access
                            </button>
                            {!isInsideNetwork && <small className="card-warning">🏥 In-network only</small>}
                          </div>

                          {/* Restricted — outside network only, justification modal */}
                          <div className={`ehr-access-card blue ${isInsideNetwork ? "disabled-card" : ""}`}>
                            <div className="card-icon">🔒</div>
                            <h3>Unrestricted Access</h3>
                            <p>Access beyond normal scope. Available <strong>only outside hospital Wi-Fi</strong>. Requires written justification.</p>
                            <button
                              className="btn btn-blue btn-block"
                              onClick={() => { setRestrictedReason(""); setShowRestrictedModal(true); }}
                              disabled={isInsideNetwork}
                            >
                              Request with Justification
                            </button>
                            {isInsideNetwork && <small className="card-warning">🌐 External network only</small>}
                          </div>

                          {/* Emergency — always available, break-glass modal */}
                          <div className={`ehr-access-card red`}>
                            <div className="card-icon">🚨</div>
                            <h3>Break-Glass</h3>
                            <p>Emergency override for critical situations. Mandatory justification. Strictly audited.</p>
                            <button
                              className="btn btn-emergency btn-block"
                              onClick={() => { setEmergencyReason(""); setShowEmergencyModal(true); }}
                            >
                              Break Glass
                            </button>
                          </div>
                        </div>
                     </section>
                 ) : (
                    /* MEDICAL REPORT CARD (If Access Granted) */
                     <section className="ehr-section medical-report-card">
                        <div className="report-header-banner">
                            <div className="banner-left">
                                <h3>HOSPITAL PATIENT REPORT</h3>
                                <p>Confidential Medical Record</p>
                            </div>
                            <FaClipboardList className="banner-icon" />
                        </div>
                        
                        {selectedPatientData ? (
                            <div className="report-body compact-view">
                                {/* Top Row: Essentials */}
                                <div className="report-grid-header">
                                    <div className="report-field">
                                        <label>Patient Name</label>
                                        <div className="value text-lg">{selectedPatientData.name}</div>
                                    </div>
                                    <div className="report-field">
                                        <label>Patient ID</label>
                                        <div className="value monospace">{selectedPatientData.patient_id || "N/A"}</div>
                                    </div>
                                    <div className="report-field">
                                        <label>Diagnosis</label>
                                        <div className="value badge-style">{selectedPatientData.diagnosis}</div>
                                    </div>
                                </div>

                                <hr className="report-divider" />

                                {/* Main Content: 2 Columns */}
                                <div className="report-grid-content">
                                    <div className="report-field box-field">
                                        <label>Treatment Plan</label>
                                        <div className="value text-content">{selectedPatientData.treatment}</div>
                                    </div>
                                    <div className="report-field box-field">
                                        <label>Clinical Notes</label>
                                        <div className="value text-content">{selectedPatientData.notes}</div>
                                    </div>
                                </div>
                                
                                {/* Footer Info */}
                                <div className="report-footer-row">
                                    <div className="report-field">
                                         <label>Email</label>
                                         <div className="value text-sm">{selectedPatientData.email}</div>
                                    </div>
                                    {accessExpiryTime && (
                                        <div className="expiry-badge">
                                            <FaCheckCircle /> Expires: {accessExpiryTime.toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="report-loading-skeleton" style={{padding: "2rem"}}>
                                {/* Skeleton Header */}
                                <div style={{display: "flex", gap: "2rem", marginBottom: "2rem"}}>
                                    <div style={{flex: 2}}>
                                        <div className="skeleton skeleton-text narrow" style={{marginBottom: "0.5rem"}}></div>
                                        <div className="skeleton skeleton-title"></div>
                                    </div>
                                    <div style={{flex: 1}}>
                                        <div className="skeleton skeleton-text narrow" style={{marginBottom: "0.5rem"}}></div>
                                        <div className="skeleton skeleton-text"></div>
                                    </div>
                                </div>
                                
                                <div className="skeleton" style={{height: "1px", width: "100%", marginBottom: "2rem"}}></div>

                                {/* Skeleton Content */}
                                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem"}}>
                                    <div className="skeleton skeleton-block"></div>
                                    <div className="skeleton skeleton-block"></div>
                                </div>
                            </div>
                        )}
                     </section>
                 )}
             </div>
         )}
         
         {!selectedPatient && (
             <div className="empty-state-placeholder">
                 <FaUserInjured className="empty-state-icon" />
                 <h3>Select a Patient</h3>
                 <p>Use the search bar above to find a patient and request access.</p>
             </div>
         )}

      </div>

      {/* ── Emergency (Break-Glass) Justification Modal ── */}
      {showEmergencyModal && (
        <div className="modal-overlay">
          <div className="modal-content emergency-modal">
            <div className="modal-header emergency-header">
              <h2>🚨 Break-Glass Emergency Access</h2>
              <button className="close-btn" onClick={() => setShowEmergencyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="warning-text">
                You are about to break the glass for <strong>{selectedPatient}</strong>.
                This action is <strong>permanently logged</strong> and reviewed by administration.
              </p>
              <label>Mandatory Clinical Justification:</label>
              <textarea
                className="emergency-reason-input"
                placeholder="Describe the emergency and clinical reason for access..."
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                autoFocus
              />
              <p style={{ color: checkStatus.color, fontSize: "0.85rem", fontWeight: "600", marginTop: "0.25rem", minHeight: "1.25rem" }}>
                {checkStatus.message}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowEmergencyModal(false)}>Cancel</button>
              <button
                className="btn btn-emergency"
                onClick={() => {
                  handleAccessRequest("emergency", emergencyReason);
                  setShowEmergencyModal(false);
                  setEmergencyReason("");
                }}
                disabled={!emergencyReason.trim()}
              >
                🚨 Confirm & Break Glass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Restricted / Unrestricted Justification Modal ── */}
      {showRestrictedModal && (
        <div className="modal-overlay">
          <div className="modal-content emergency-modal">
            <div className="modal-header" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "12px 12px 0 0" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>🔒 Unrestricted Access — Justification Required</h2>
              <button className="close-btn" onClick={() => setShowRestrictedModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="warning-text" style={{ borderColor: "#3b82f6", background: "#eff6ff", color: "#1d4ed8" }}>
                You are requesting <strong>unrestricted access</strong> to records of <strong>{selectedPatient}</strong>.
                A written justification is mandatory and will be retained in the audit log.
              </p>
              <label>Justification <span style={{ color: "#ef4444" }}>*</span></label>
              <textarea
                className="emergency-reason-input"
                placeholder="State the clinical reason why unrestricted access is needed..."
                value={restrictedReason}
                onChange={(e) => setRestrictedReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowRestrictedModal(false)}>Cancel</button>
              <button
                className="btn btn-blue"
                onClick={() => {
                  handleAccessRequest("restricted", restrictedReason);
                  setShowRestrictedModal(false);
                  setRestrictedReason("");
                }}
                disabled={!restrictedReason.trim()}
              >
                🔒 Confirm & Request Access
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NurseHomeTab;
