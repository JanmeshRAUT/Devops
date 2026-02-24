import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';
import {
  FaUserInjured,
  FaSync,
  FaSpinner,
  FaEdit,
  FaTimes,
  FaSave,
  FaLock
} from 'react-icons/fa';
import "../../css/DoctorPatientsTab.css";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

/* ─── Inline Edit Modal ─────────────────────────────────── */
const EditPatientModal = ({ patient, onClose, onSaved }) => {
  const [form, setForm] = useState({
    age:       patient.age       || "",
    gender:    patient.gender    || "Male",
    diagnosis: patient.diagnosis || "",
    treatment: patient.treatment || "",
    notes:     patient.notes     || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const token = localStorage.getItem("authToken") || "";
      const res = await axios.post(
        `${API_URL}/update_patient`,
        { patientId: patient.id, updates: form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        onSaved();
        onClose();
      } else {
        setError(res.data.error || "Update failed.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content patient-form-modal"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3><FaEdit style={{ marginRight: "0.4rem" }} />Edit — {patient.patientName || patient.name}</h3>
          <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <form className="patient-form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="number" name="age" min="1" max="120"
                value={form.age} onChange={handleChange}
                placeholder="Age"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Primary Diagnosis</label>
            <input
              type="text" name="diagnosis"
              value={form.diagnosis} onChange={handleChange}
              placeholder="e.g. Type 2 Diabetes"
            />
          </div>

          <div className="form-group">
            <label>Treatment Plan</label>
            <textarea
              name="treatment" rows="3"
              value={form.treatment} onChange={handleChange}
              placeholder="Current treatment details…"
            />
          </div>

          <div className="form-group">
            <label>Clinical Notes</label>
            <textarea
              name="notes" rows="3"
              value={form.notes} onChange={handleChange}
              placeholder="Additional clinical observations…"
            />
          </div>

          {error && <p className="form-message error">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn btn-gray" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-blue" disabled={saving}>
              {saving
                ? <><FaSpinner className="spin-icon" /> Saving…</>
                : <><FaSave /> Save Changes</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Tab ──────────────────────────────────────────── */
const DoctorPatientsTab = ({
  myPatients,
  loading,
  selectedPatient,
  handleSelectPatient,
  fetchMyPatients,
  setActiveTab,
  isInsideNetwork,
}) => {
  const [editingPatient, setEditingPatient] = useState(null);

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
                  const name  = p.patientName || p.name || "—";
                  const email = p.patient_email || p.email || "—";
                  const isSelected = selectedPatient === name;

                  return (
                    <tr key={p.id || idx} className={isSelected ? "row-selected" : ""}>

                      {/* Patient identity */}
                      <td>
                        <div className="patient-cell">
                          <div className="patient-avatar-sm">{name[0].toUpperCase()}</div>
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
                        <div className="date-cell">{fmt(p.updatedAt || p.last_updated_at)}</div>
                      </td>

                      {/* Status */}
                      <td>
                        <div className="status-cell">
                          <span className={`badge ${p.diagnosis ? "badge-active" : "badge-new"}`}>
                            {p.diagnosis ? "Active" : "New"}
                          </span>
                        </div>
                      </td>

                      {/* Action — Edit (in-network only) */}
                      <td className="col-actions">
                        <button
                          className={`btn-details ${!isInsideNetwork ? "btn-disabled-network" : ""}`}
                          onClick={() => isInsideNetwork && setEditingPatient(p)}
                          disabled={!isInsideNetwork}
                          title={
                            isInsideNetwork
                              ? "Edit patient record"
                              : "🔒 Only available inside hospital network"
                          }
                        >
                          {isInsideNetwork
                            ? <><FaEdit style={{ fontSize: "0.75rem" }} /> Edit</>
                            : <><FaLock style={{ fontSize: "0.7rem" }} /> Edit</>
                          }
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

      {/* ── Edit Modal ── */}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSaved={fetchMyPatients}
        />
      )}

    </div>
  );
};

export default DoctorPatientsTab;
