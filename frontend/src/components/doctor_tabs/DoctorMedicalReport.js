import React from 'react';
import { FaFilePdf, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import "../../css/Skeleton.css";

const DoctorMedicalReport = ({ 
  patientData, 
  setShowPDFModal, 
  handleDownloadPDF,
  isLoading,
  accessMessage
}) => {
  if (isLoading) {
    return (
        <section className="medical-report-container">
             <div className="report-loading-skeleton" style={{padding: "1rem"}}>
                {/* Header Skeleton */}
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "2rem"}}>
                    <div style={{width: "40%"}}> <div className="skeleton skeleton-title"></div> <div className="skeleton skeleton-text narrow"></div> </div>
                    <div style={{width: "20%"}}> <div className="skeleton skeleton-block" style={{height: "40px"}}></div> </div>
                </div>
                {/* Content Skeleton */}
                <div className="skeleton" style={{height: "1px", width: "100%", marginBottom: "1.5rem"}}></div>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem"}}>
                     <div className="skeleton skeleton-block" style={{height: "100px"}}></div>
                     <div className="skeleton skeleton-block" style={{height: "100px"}}></div>
                     <div className="skeleton skeleton-block" style={{height: "100px"}}></div>
                </div>
             </div>
        </section>
    )
  }

  // Handle missing or empty patient data
  if (!patientData) {
    return (
      <section className="medical-report-container">
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
          padding: "2rem",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <FaExclamationTriangle style={{ fontSize: "2rem", marginBottom: "1rem" }} />
          <h3>No Patient Data Available</h3>
          <p>Unable to load patient record. Please try again or contact support.</p>
        </div>
      </section>
    );
  }

  if (typeof patientData === 'object' && Object.keys(patientData).length === 0) {
    return (
      <section className="medical-report-container">
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
          padding: "2rem",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <FaExclamationTriangle style={{ fontSize: "2rem", marginBottom: "1rem" }} />
          <h3>Patient Record Empty</h3>
          <p>The patient record contains no data. Please contact the medical team.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="medical-report-container">
      {/* Access Context Banner */}
      {accessMessage && (
        <div style={{
          backgroundColor: accessMessage.includes("🚨") ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${accessMessage.includes("🚨") ? "#fecaca" : "#bbf7d0"}`,
          color: accessMessage.includes("🚨") ? "#991b1b" : "#166534",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          {accessMessage}
        </div>
      )}

      {/* Header */}
      <div className="report-header">
        <div>
          <h2 className="report-header-title">
            Medical Status Report
          </h2>
          <p className="report-subtitle">
            CONFIDENTIAL PATIENT RECORD
          </p>
        </div>
        <div className="report-actions">
          <button
            className="btn btn-blue btn-sm"
            onClick={() => setShowPDFModal(true)}
          >
            <FaFilePdf /> View
          </button>
          <button
            className="btn btn-gray btn-sm"
            onClick={handleDownloadPDF}
          >
            <FaFilePdf /> Download
          </button>
        </div>
      </div>

      {/* Demographics Grid */}
      <div className="report-demographics">
        <div className="demographic-item">
          <strong>Patient Name</strong>
          <span>{patientData.name || patientData.patientName || "Unknown"}</span>
        </div>
        <div className="demographic-item">
          <strong>Email</strong>
          <span>{patientData.email || patientData.patient_email || "N/A"}</span>
        </div>
        <div className="demographic-item">
          <strong>Age / Gender</strong>
          <span>{patientData.age || "—"} / {patientData.gender || "—"}</span>
        </div>
        <div className="demographic-item">
          <strong>Last Visit</strong>
          <span>{patientData.last_visit || "Not recorded"}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="report-main-content">
        {/* Diagnosis */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 className="report-section-title">Medical Diagnosis</h3>
          <div className="diagnosis-box">
            {patientData.diagnosis || "Pending Evaluation"}
          </div>
        </div>

        {/* Treatment */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 className="report-section-title">Treatment Plan</h3>
          <p className="report-text">
            {patientData.treatment || "No treatment plan recorded."}
          </p>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 className="report-section-title">Clinical Notes</h3>
          <p className="report-text">
            {patientData.notes || "No clinical notes available."}
          </p>
        </div>
      </div>

      <div className="report-footer">
        <FaLock /> This report is encrypted and access-logged. Unauthorized sharing is prohibited.
      </div>
    </section>
  );
};

export default DoctorMedicalReport;
