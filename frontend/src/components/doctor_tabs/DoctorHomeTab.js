import React, { useState, useMemo, useRef, useEffect } from 'react';
import { API_URL } from '../../api';
import { 
  FaUserMd, 
  FaSpinner,
  FaSearch,
  FaUserPlus,
  FaTimes,
  FaUserFriends,
  FaClipboardCheck,
  FaServer,
  FaArrowLeft
} from 'react-icons/fa';
import TrustScoreMeter from "../TrustScoreMeter";
import DoctorMedicalReport from "./DoctorMedicalReport";
import "../../css/DoctorHomeTab.css";
import "../../css/DashboardStats.css";

const DoctorHomeTab = ({
  trustScore,
  loading,
  logs,
  setActiveTab,
  allPatients,
  myPatients,
  selectedPatient,
  selectedPatientData,
  handleSelectPatient,
  setShowPatientForm,
  isInsideNetwork,
  handleAccessRequest,
  accessResponse,
  setShowPDFModal,
  handleDownloadPDF,
  accessControl,
  ipAddress
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [restrictedReason, setRestrictedReason] = useState('');
  const [showMedicalRecordPage, setShowMedicalRecordPage] = useState(false); // NEW: State for medical record page
  const searchRef = useRef(null);

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

  // Build a Set of my-patient IDs for fast lookup
  const myPatientIds = useMemo(() => {
    const ids = new Set();
    (myPatients || []).forEach(p => p.id && ids.add(p.id));
    return ids;
  }, [myPatients]);

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    const source = searchTerm.trim() ? allPatients : allPatients;
    if (!searchTerm.trim()) return source;
    const term = searchTerm.toLowerCase();
    return source.filter(p => {
      const name  = (p.patientName || p.name || p.patient_name || "").toLowerCase();
      const email = (p.patient_email || p.email || "").toLowerCase();
      const id    = String(p.id || "");
      return name.includes(term) || email.includes(term) || id.includes(term);
    });
  }, [allPatients, searchTerm]);

  // Split filtered results into MY patients vs OTHERS
  const myFilteredPatients    = useMemo(() => filteredPatients.filter(p => myPatientIds.has(p.id)), [filteredPatients, myPatientIds]);
  const otherFilteredPatients = useMemo(() => filteredPatients.filter(p => !myPatientIds.has(p.id)), [filteredPatients, myPatientIds]);

  // Sync search term with selected patient when it changes
  useEffect(() => {
    if (selectedPatient) {
      setSearchTerm(selectedPatient);
    }
  }, [selectedPatient]);

  const onSelectItem = (patient) => {
    const name = patient.patientName || patient.name || patient.patient_name || "";
    handleSelectPatient(name);
    setSearchTerm(name);
    setIsSearchOpen(false);
  };
  
  /* --- AI PRE-CHECK LOGIC --- */
  const [checkStatus, setCheckStatus] = useState({ message: "", color: "#94a3b8" }); // Default Slate
  const debounceRef = useRef(null);

  useEffect(() => {
    // Reset if empty
    if (!emergencyReason.trim()) {
        setCheckStatus({ message: "", color: "#94a3b8" });
        return;
    }

    // Debounce API Call
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
                setCheckStatus({ message: data.message, color: "#16a34a" }); // Green
            } else if (data.status === "weak") {
                setCheckStatus({ message: data.message, color: "#ca8a04" }); // Yellow/Orange
            } else {
                setCheckStatus({ message: data.message, color: "#dc2626" }); // Red
            }
        } catch (err) {
            console.error("Pre-check failed", err);
            setCheckStatus({ message: "Offline check unavailable", color: "#94a3b8" });
        }
    }, 600); // 600ms delay

  }, [emergencyReason]);

  // NEW: Check if we should show medical record page automatically when access is granted
  useEffect(() => {
    if (accessResponse?.patient_data && Object.keys(accessResponse.patient_data).length > 0) {
      setShowMedicalRecordPage(true);
    }
  }, [accessResponse]);
  
  // NEW: If showing medical record page, render that instead
  if (showMedicalRecordPage && accessResponse?.patient_data) {
    return (
      <div className="medical-record-page">
        <div className="medical-record-header">
          <button 
            className="btn-back"
            onClick={() => setShowMedicalRecordPage(false)}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1>Medical Record - {accessResponse.patient_data.name || selectedPatient}</h1>
        </div>
        
        <DoctorMedicalReport
          patientData={accessResponse.patient_data}
          setShowPDFModal={setShowPDFModal}
          handleDownloadPDF={handleDownloadPDF}
          isLoading={loading.access}
          accessMessage={accessResponse.message}
        />
      </div>
    );
  }
  
  return (
    <div className="dashboard-grid">
      
      {/* ============== LEFT COLUMN: TRUST & ACTIVITY ============== */}
      <div className="trust-panel">
        <section className="ehr-section trust-panel-content">
          <h2>🛡️ Trust Score</h2>
          
          {/* Meter Section */}
          <div className="meter-section">
             {loading.trust ? (
              <div className="loading-spinner">
                <FaSpinner className="spin-icon" /> Loading...
              </div>
            ) : (
              <TrustScoreMeter score={trustScore} />
            )}
          </div>

          {/* Recent Activity Mini-Section */}
          <div className="activity-section">
            <h3 className="activity-heading">
              Recent Activity
            </h3>
            
            <div className="activity-list">
              {logs.slice(0, 3).map((log, index) => (
                <div key={index} className="activity-item">
                  <div 
                    className={`activity-indicator ${
                      log.status === "Success" || log.status === "Granted" ? "success" : "error"
                    }`} 
                  />
                  <div className="activity-item-content">
                     <div className="activity-action">
                       {log.action}
                     </div>
                     <div className="activity-time">
                       {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="activity-empty">
                  No recent activity recorded.
                </p>
              )}
            </div>
            
            <button 
              onClick={() => setActiveTab("accessLogs")} 
              className="btn-view-all"
            >
              View All Activity →
            </button>
          </div>
        </section>
      </div>

      {/* ============== RIGHT COLUMN: MAIN CONTENT ============== */}
      <div className="dashboard-main-content">
        
       {/* 0. QUICK STATS ROW */}
       <div className="stats-grid-row">
          <div className="stat-card stat-blue">
              <div className="stat-icon-wrapper"><FaUserFriends /></div>
              <div className="stat-content">
                  <div className="stat-value">{allPatients.length}</div>
                  <div className="stat-label">Total Patients</div>
              </div>
          </div>
          <div className="stat-card stat-green">
              <div className="stat-icon-wrapper"><FaClipboardCheck /></div>
              <div className="stat-content">
                  <div className="stat-value">{logs.length}</div>
                  <div className="stat-label">Total Activities</div>
              </div>
          </div>
          <div className="stat-card stat-purple">
              <div className="stat-icon-wrapper"><FaServer /></div>
              <div className="stat-content">
                  <div className="stat-value">98.5%</div>
                  <div className="stat-label">System Uptime</div>
              </div>
          </div>
       </div>

        {/* 1. PATIENT MANAGEMENT - PROFESSIONAL TOOLBAR */}
        <div className="patient-panel">
          <section className="ehr-section toolbar-section">
            <div className="toolbar-header-row">
               <h2 className="toolbar-title"><FaUserMd /> Patient Records Management</h2>
               <div className="toolbar-side-actions">
                  <button
                    className="btn-pro btn-pro-green"
                    onClick={() => setShowPatientForm(true)}
                  >
                    <FaUserPlus /> <span>Register New Patient</span>
                  </button>
               </div>
            </div>

            <div className="patient-toolbar-content">
              {/* Search Input */}
              <div className="search-field-wrapper" ref={searchRef}>
                <FaSearch className="field-icon" />
                <input
                  type="text"
                  className="patient-input-pro"
                  placeholder="Search patient by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearchOpen(e.target.value.length > 0);
                    if (!e.target.value) handleSelectPatient("");
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />

                {searchTerm && (
                  <button
                    className="clear-search-btn"
                    onClick={() => {
                      setSearchTerm("");
                      handleSelectPatient("");
                      setIsSearchOpen(false);
                    }}
                    title="Clear"
                  >
                    <FaTimes />
                  </button>
                )}

                {/* Autocomplete Dropdown — split into My Patients / Others */}
                {isSearchOpen && (myFilteredPatients.length > 0 || otherFilteredPatients.length > 0) && (
                  <div className="search-results-dropdown">
                    {/* ── My Patients ── */}
                    {myFilteredPatients.length > 0 && (
                      <>
                        <div className="search-group-label search-group-mine">📋 My Patients</div>
                        {myFilteredPatients.map((p, idx) => {
                          const displayName  = p.patientName || p.name || "Unknown";
                          const displayEmail = p.patient_email || p.email || "—";
                          const isActive     = selectedPatient === displayName;
                          return (
                            <div
                              key={p.id || idx}
                              className={`result-item result-mine ${isActive ? "active" : ""}`}
                              onClick={() => onSelectItem(p)}
                            >
                              <div className="result-avatar result-avatar-mine">{displayName[0].toUpperCase()}</div>
                              <div className="result-info">
                                <span className="result-name">{displayName}</span>
                                <span className="result-email">{displayEmail}</span>
                              </div>
                              {p.id && <span className="result-id result-id-mine">My Patient</span>}
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* ── Other Patients ── */}
                    {otherFilteredPatients.length > 0 && (
                      <>
                        <div className="search-group-label search-group-others">🔒 Other Patients</div>
                        {otherFilteredPatients.map((p, idx) => {
                          const displayName  = p.patientName || p.name || "Unknown";
                          const displayEmail = p.patient_email || p.email || "—";
                          const isActive     = selectedPatient === displayName;
                          return (
                            <div
                              key={p.id || idx}
                              className={`result-item result-other ${isActive ? "active" : ""}`}
                              onClick={() => onSelectItem(p)}
                            >
                              <div className="result-avatar result-avatar-other">{displayName[0].toUpperCase()}</div>
                              <div className="result-info">
                                <span className="result-name">{displayName}</span>
                                <span className="result-email">{displayEmail}</span>
                              </div>
                              {p.id && <span className="result-id">ID #{p.id}</span>}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}

                {/* No results message */}
                {isSearchOpen && searchTerm && myFilteredPatients.length === 0 && otherFilteredPatients.length === 0 && (
                  <div className="search-results-dropdown">
                    <div className="no-results">🚫 No patients found for &quot;{searchTerm}&quot;</div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Patient Card — shown below search when a patient is picked */}
            {selectedPatient && (
              <div className="selected-patient-card">
                <div className="spc-left">
                  <div className="spc-avatar">
                    {selectedPatient[0].toUpperCase()}
                  </div>
                  <div className="spc-info">
                    <span className="spc-name">{selectedPatient}</span>
                    <span className="spc-sub">
                      {selectedPatientData ? (
                        <>
                          {selectedPatientData.age ? `${selectedPatientData.age} yrs` : ""}
                          {selectedPatientData.age && selectedPatientData.gender ? " · " : ""}
                          {selectedPatientData.gender || ""}
                          {(selectedPatientData.age || selectedPatientData.gender) && selectedPatientData.diagnosis ? " · " : ""}
                          {selectedPatientData.diagnosis || ""}
                        </>
                      ) : (
                        "Loading patient info…"
                      )}
                    </span>
                    {selectedPatientData?.id && (
                      <span className="spc-id">ID #{selectedPatientData.id}</span>
                    )}
                  </div>
                </div>
                <button
                  className="btn-pro btn-pro-indigo"
                  onClick={() => setActiveTab("patients")}
                  title="Edit Patient Details"
                >
                  <FaUserMd /> Edit Record
                </button>
              </div>
            )}
          </section>
        </div>

        {/* 2. ACCESS CONTROL */}
        <div className="access-panel">
        <section className="ehr-section">
          <h2>🔐 Request Access</h2>
          
          {/* Restricted Access Warning */}
          {accessControl?.isAccessBlocked && (
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
              color: 'white',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <strong>🔒 Access Restricted</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
                {isInsideNetwork 
                  ? '⚠️ Within Hospital Network - Admin Users Only'
                  : '⚠️ Outside Hospital Network - Admin Users Only'}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                Access requests are restricted to administrator accounts. Contact your system administrator if you believe this is an error.
              </p>
            </div>
          )}

          <div className="ehr-access-grid">

            {/* Normal — in-network only */}
            <div className={`ehr-access-card green ${!isInsideNetwork ? "disabled-card" : ""} ${accessControl?.isAccessBlocked ? "disabled-card" : ""}`}>
              <div className="card-icon">🏥</div>
              <h3>Normal Access</h3>
              <p>Routine care access. Available <strong>only within hospital Wi-Fi</strong>. No justification required.</p>
              <button
                className="btn btn-green btn-block"
                onClick={() => handleAccessRequest("normal")}
                disabled={loading.access || !selectedPatient || !isInsideNetwork || accessControl?.isAccessBlocked}
              >
                {loading.access ? "Processing..." : "Request Access"}
              </button>
              {!isInsideNetwork && <small className="card-warning">🏥 In-network only</small>}
              {accessControl?.isAccessBlocked && <small className="card-warning">🔒 Admin only</small>}
            </div>

            {/* Restricted — outside network only, justification modal */}
            <div className={`ehr-access-card blue ${isInsideNetwork ? "disabled-card" : ""} ${accessControl?.isAccessBlocked ? "disabled-card" : ""}`}>
              <div className="card-icon">🔒</div>
              <h3>Unrestricted Access</h3>
              <p>Access beyond normal scope. Available <strong>only outside hospital Wi-Fi</strong>. Requires written justification.</p>
              <button
                className="btn btn-blue btn-block"
                onClick={() => { setRestrictedReason(""); setShowRestrictedModal(true); }}
                disabled={loading.access || !selectedPatient || isInsideNetwork || accessControl?.isAccessBlocked}
              >
                Request with Justification
              </button>
              {isInsideNetwork && <small className="card-warning">🌐 External network only</small>}
              {accessControl?.isAccessBlocked && <small className="card-warning">🔒 Admin only</small>}
            </div>

            {/* Emergency — always available, break-glass modal */}
            <div className={`ehr-access-card red ${accessControl?.isAccessBlocked ? "disabled-card" : ""}`}>
              <div className="card-icon">🚨</div>
              <h3>Break-Glass</h3>
              <p>Emergency override for critical situations. Mandatory justification. Strictly audited.</p>
              <button
                className="btn btn-emergency btn-block"
                onClick={() => { setEmergencyReason(""); setShowEmergencyModal(true); }}
                disabled={loading.access || !selectedPatient || accessControl?.isAccessBlocked}
              >
                Break Glass
              </button>
              {accessControl?.isAccessBlocked && <small className="card-warning">� Admin only</small>}
            </div>

          </div>
        </section>
        </div>
        
      </div> {/* End dashboard-main-content */}

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

export default DoctorHomeTab;
