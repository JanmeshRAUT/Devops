import React from 'react';
import { useNetworkStatus } from '../hooks/useAccessControl';
import '../css/AccessControl.css';

/**
 * NetworkStatus Component
 * Displays network status bar and access restrictions
 */
const NetworkStatus = ({ userRole, showRestrictions = true }) => {
  const { isInsideNetwork, loading, ipAddress } = useNetworkStatus();

  if (loading) {
    return (
      <div className="network-status-bar unknown-network">
        <div className="network-status-content">
          <div className="network-status-icon">🔄</div>
          <div className="network-status-text">
            <strong>Checking Network Status...</strong>
            <small>Please wait</small>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';
  const networkClass = isInsideNetwork ? 'inside-network' : 'outside-network';
  const networkLabel = isInsideNetwork ? 'Inside Trusted Network' : 'Outside Trusted Network';
  const networkIcon = isInsideNetwork ? '✅' : '⚠️';

  return (
    <>
      {/* Network Status Bar */}
      <div className={`network-status-bar ${networkClass}`}>
        <div className="network-status-content">
          <div className="network-status-icon">{networkIcon}</div>
          <div className="network-status-text">
            <strong>{networkLabel}</strong>
            <small>IP: {ipAddress}</small>
          </div>
        </div>
        {!isAdmin && (
          <div className="network-status-content">
            {isInsideNetwork ? (
              <div style={{ fontSize: '11px', fontWeight: 500 }}>
                ✅ Normal Access • 🚫 Restricted Access Disabled
              </div>
            ) : (
              <div style={{ fontSize: '11px', fontWeight: 500 }}>
                🚫 Normal Access Disabled • ✅ Restricted Access
              </div>
            )}
          </div>
        )}
      </div>

      {/* Access Restrictions Banner */}
      {showRestrictions && !isAdmin && (
        <div className={`access-restriction-banner ${isInsideNetwork ? 'blocked-restricted' : 'blocked-normal'}`}>
          {isInsideNetwork
            ? 'Restricted Access is disabled while inside the network. Some buttons will be unavailable.'
            : 'Normal Access is disabled while outside the network. Some buttons will be unavailable.'}
        </div>
      )}
    </>
  );
};

export default NetworkStatus;
