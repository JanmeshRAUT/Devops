import React from 'react';
import { FaUserEdit, FaBed, FaHeartbeat, FaStethoscope, FaNotesMedical, FaMedkit } from 'react-icons/fa';

const PatientMedicalRecord = ({ patient }) => {
  if (!patient) return null;

  return (
    <section className="logs-section" style={{ animation: 'fadeUp 1s ease both' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div className="section-title">
          <FaUserEdit className="section-icon" />
          <span>My Medical Profile</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Personal Details */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', marginTop: 0 }}>
            <FaBed color="#3b82f6" /> Demographics
          </h3>
          <p><strong>Name:</strong> {patient.patientName || patient.name}</p>
          <p><strong>Age:</strong> {patient.age || '—'}</p>
          <p><strong>Gender:</strong> {patient.gender || '—'}</p>
          <p><strong>Email:</strong> {patient.patient_email || '—'}</p>
          <p><strong>Assigned Doctor:</strong> {patient.doctor_name || 'Unassigned'}</p>
        </div>

        {/* Diagnosis & Notes */}
        <div style={{ background: '#fff1f2', padding: '1.5rem', borderRadius: '16px', border: '1px solid #fecdd3' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9f1239', marginTop: 0 }}>
            <FaHeartbeat color="#e11d48" /> Diagnosis
          </h3>
          <p style={{ color: '#881337', lineHeight: '1.5' }}>
            {patient.diagnosis || 'No diagnosis currently recorded on your file.'}
          </p>
        </div>

        <div style={{ background: '#f0fdfa', padding: '1.5rem', borderRadius: '16px', border: '1px solid #ccfbf1' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#115e59', marginTop: 0 }}>
            <FaMedkit color="#0d9488" /> Treatment Plan
          </h3>
          <p style={{ color: '#134e4a', lineHeight: '1.5' }}>
            {patient.treatment || 'No active treatment plan prescribed.'}
          </p>
        </div>

        <div style={{ background: '#fefce8', padding: '1.5rem', borderRadius: '16px', border: '1px solid #fef08a' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#854d0e', marginTop: 0 }}>
            <FaStethoscope color="#ca8a04" /> Clinical Notes
          </h3>
          <p style={{ color: '#713f12', lineHeight: '1.5' }}>
            {patient.notes || 'No clinical notes added by the doctor yet.'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PatientMedicalRecord;
