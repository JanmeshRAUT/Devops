import React from 'react';
import { FaHistory, FaCheckCircle } from 'react-icons/fa';

const PatientStatsBar = ({ logs }) => {
  const authorizedCount = logs.filter(
    (l) => l.status.includes('Grant') || l.status.includes('Approve') || l.status.includes('Success')
  ).length;

  return (
    <section className="stats-bar">
      <div className="stat-item">
        <div className="stat-icon access-icon">
          <FaHistory />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Access Records</span>
          <span className="stat-value">{logs.length}</span>
        </div>
      </div>
      <div className="stat-item">
        <div className="stat-icon granted-icon">
          <FaCheckCircle />
        </div>
        <div className="stat-content">
          <span className="stat-label">Authorized Access</span>
          <span className="stat-value">{authorizedCount}</span>
        </div>
      </div>
    </section>
  );
};

export default PatientStatsBar;
