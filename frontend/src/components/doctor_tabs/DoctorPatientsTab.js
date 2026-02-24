import React from 'react';
import {
  FaUserInjured,
  FaSync,
  FaSpinner,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import "../../css/DoctorPatientsTab.css";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const DoctorPatientsTab = ({
  myPatients,
  loading,
  selectedPatient,
  handleSelectPatient,
  fetchMyPatients,
  setActiveTab,          // ← used to redirect to Dashboard
  isInsideNetwork,
}) => {
  const handleViewInDashboard = (patientName) => {
    handleSelectPatient(patientName);   // pre-select in Dashboard search
    setActiveTab("dashboard");          // switch to Dashboard tab
  };

  return (
    <div className="patients-content-wrapper">

      {/* ── Header ── */}
      <div className="patients-tab-header">
        <div className="header-left-group">
          <div className="header-icon-box"><FaUserInjured /></div>
          <div className="header-title-box">
            <h2>Patient Registry</h2>
            <p>
              {myPatients.length} patient{myPatients.length !== 1 ? "s" : ""} assigned to you
              {!isInsideNetwork && (
                <span className="network-warning-inline"> · ⚠️ External network — view only</span>
              )}
            </p>
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm btn-refresh"
          onClick={fetchMyPatients}
          disabled={loading.myPatients}
        >
          {loading.myPatients ? <FaSpinner className="spin-icon" /> : <FaSync />} Refresh
        </button>
      </div>

      {/* ── Table ── */}
      <div className="patients-table-container">
        {loading.myPatients ? (
          <div className="loading-state">
            <FaSpinner className="spin-icon large-spinner" />
            <p>Loading patient records…</p>
          </div>
        ) : myPatients.length > 0 ? (
          <div className="table-scroll-area">
            <table className="patients-table">
              <thead>
                <tr>
                  <th className="th-patient">Patient</th>
                  <th className="th-demographics">Age / Gender</th>
                  <th className="th-diagnosis">Diagnosis</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th className="th-actions">Action</th>
                </tr>
              </thead>
              <tbody>
                {myPatients.map((p, idx) => {
                  const name   = p.patientName || p.name || "—";
                  const email  = p.patient_email || p.email || "—";
                  const isSelected = selectedPatient === name;

                  return (
                    <tr
                      key={p.id || idx}
                      className={isSelected ? "row-selected" : ""}
                    >
                      {/* Patient identity */}
                      <td>
                        <div className="patient-cell">
                          <div className="patient-avatar-sm">
                            {name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="patient-name">{name}</div>
                            <div className="patient-email">{email}</div>
                            <div className="patient-id-badge">ID #{p.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Demographics */}
                      <td>
                        <div className="demographics-cell">
                          {p.age ? `${p.age} yrs` : "—"}
                          <span className="separator-pipe">|</span>
                          {p.gender || "—"}
                        </div>
                      </td>

                      {/* Diagnosis */}
                      <td>
                        <div className="diagnosis-cell">
                          {p.diagnosis
                            ? <span className="diag-text">{p.diagnosis}</span>
                            : <span className="text-muted">Not recorded</span>
                          }
                        </div>
                      </td>

                      {/* Last updated */}
                      <td>
                        <div className="date-cell">
                          {fmt(p.updatedAt || p.last_updated_at)}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <div className="status-cell">
                          <span className={`badge ${p.diagnosis ? "badge-active" : "badge-new"}`}>
                            {p.diagnosis ? "Active" : "New"}
                          </span>
                        </div>
                      </td>

                      {/* Action — opens Dashboard with patient pre-selected */}
                      <td className="col-actions">
                        <button
                          className="btn-details"
                          onClick={() => handleViewInDashboard(name)}
                          title="Open in Request Access tab"
                        >
                          <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} />
                          Request Access
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon-circle"><FaUserInjured /></div>
            <h3>No Patients Assigned</h3>
            <p>Patients assigned to you will appear here.<br />Use the Dashboard to register a new patient.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatientsTab;
