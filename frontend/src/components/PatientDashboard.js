import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";

import "../css/Patient.css";
import "../css/Notifications.css";

import PatientHeader from "./patient/PatientHeader";
import PatientStatsBar from "./patient/PatientStatsBar";
import PatientLogsSection from "./patient/PatientLogsSection";
import PatientMedicalRecord from "./patient/PatientMedicalRecord";
import Toast from "./Toast";

const PatientDashboard = ({ user, onBack }) => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("logs");
  const [toastQueue, setToastQueue] = useState([]);
  const previousLogsLength = useRef(0);
  const initialLoadDone = useRef(false);

  // Toast Functionality
  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToastQueue((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const fetchPatientData = useCallback(async () => {
    if (!user?.name) return;
    try {
      const res = await axios.get(`${API_URL}/get_patient/${user.name}`);
      if (res.data.success) {
        setPatientData(res.data.patient);
      }
    } catch (error) {
      console.error("Error fetching patient medical code:", error);
    }
  }, [user?.name]);

  const fetchLogs = useCallback(async (isPolling = false) => {
    if (!user?.name) return;
    try {
      if (!isPolling) {
        setLoading(true);
        setError(null);
      }
      
      const res = await axios.get(
        `${API_URL}/patient_access_history/${user.name}`
      );
      if (res.data.success) {
        const sortedLogs = (res.data.logs || []).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        const normalizedLogs = sortedLogs.map((log) => ({
          id: log.id,
          doctor: log.doctor_name || log.user || "Unknown User",
          role: log.doctor_role || "Doctor",
          accessType: log.action || "Data Access",
          justification: log.justification || "Routine Checkup",
          status: log.status || "Pending",
          timestamp: log.timestamp || "—",
          source: log.source || "system"
        }));

        setLogs(normalizedLogs);

        // Check for new logs during polling
        if (initialLoadDone.current && normalizedLogs.length > previousLogsLength.current) {
          showToast(`Your medical record was recently accessed. Check history.`, "info");
        }

        previousLogsLength.current = normalizedLogs.length;
        initialLoadDone.current = true;
      }
    } catch (error) {
      console.error("Error fetching access logs:", error);
      if (!isPolling) setError("Failed to load access history. Please check your connection.");
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [user?.name, showToast]);

  useEffect(() => {
    if (user?.name) {
      fetchLogs();
      fetchPatientData();

      // Poll every 15 seconds to simulate real-time notification
      const interval = setInterval(() => {
        fetchLogs(true);
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [user?.name, fetchLogs, fetchPatientData]);

  const handleReportAccess = async (logId, doctorName) => {
    if (!window.confirm(`Are you sure you want to flag this access by ${doctorName} as suspicious? Administrators will be notified.`)) return;
    
    try {
      const res = await axios.post(`${API_URL}/report_suspicious_access`, {
        log_id: logId,
        patient_name: user.name,
        doctor_name: doctorName
      });
      if(res.data.success) {
        showToast("Access successfully reported as suspicious.", "success");
        fetchLogs();
      }
    } catch (err) {
      showToast("Failed to report access.", "error");
    }
  };

  if (!user || !user.name) {
    return (
      <div className="fallback-container">
        <div className="fallback-icon">🚫</div>
        <p className="fallback-message">
          Session expired or invalid user data
        </p>
        <button className="fallback-btn" onClick={() => navigate("/")}>
          Return to Login
        </button>
      </div>
    );
  }

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/");
  };

  return (
    <div className="patient-dashboard">
      <div className="toast-container">
        {toastQueue.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      <PatientHeader user={user} handleBack={handleBack} />
      <PatientStatsBar logs={logs} />
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab("logs")}
          style={{
            padding: '1rem 2rem',
            borderRadius: '16px',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            background: activeTab === "logs" ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'white',
            color: activeTab === "logs" ? 'white' : 'var(--text-muted)',
            boxShadow: activeTab === "logs" ? '0 8px 25px rgba(59, 130, 246, 0.4)' : '0 4px 15px rgba(0,0,0,0.03)'
          }}
        >
          🔒 Access History
        </button>
        <button
          onClick={() => setActiveTab("record")}
          style={{
            padding: '1rem 2rem',
            borderRadius: '16px',
            border: 'none',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            background: activeTab === "record" ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'white',
            color: activeTab === "record" ? 'white' : 'var(--text-muted)',
            boxShadow: activeTab === "record" ? '0 8px 25px rgba(59, 130, 246, 0.4)' : '0 4px 15px rgba(0,0,0,0.03)'
          }}
        >
          📂 My Medical Record
        </button>
      </div>

      {activeTab === "logs" ? (
        <PatientLogsSection logs={logs} loading={loading} error={error} fetchLogs={() => fetchLogs(false)} onReport={handleReportAccess} />
      ) : (
        <PatientMedicalRecord patient={patientData} />
      )}

      {/* ✅ Footer Info */}
      <footer className="patient-footer">
        <p>
          🔒 All access to your medical data is logged and secured. 
          Only authorized healthcare providers can access your information.
        </p>
      </footer>
    </div>
  );
};

export default PatientDashboard;
