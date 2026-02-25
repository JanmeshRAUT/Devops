import React from 'react';

const PatientHeader = ({ user, handleBack }) => {
  return (
    <header className="patient-header">
      <div className="header-content">
        <div className="header-info">
          <h1 className="welcome-text">👋 Welcome, {user.name}</h1>
          <p className="subtext">
            Your secure medical data access history is shown below
          </p>
        </div>
        <button className="logout-button" onClick={handleBack} title="Logout">
          Logout
        </button>
      </div>
    </header>
  );
};

export default PatientHeader;
