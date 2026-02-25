import { useEffect, useState } from 'react';
import { API_URL } from '../api';

/**
 * Hook to check if user is within trusted network
 * Returns: { isInsideNetwork, loading, error, ipAddress }
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState({
    isInsideNetwork: null,
    loading: true,
    error: null,
    ipAddress: 'unknown'
  });

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const response = await fetch(`${API_URL}/api/general/ip_check`);
        const data = await response.json();
        
        setNetworkStatus({
          isInsideNetwork: data.inside_network,
          loading: false,
          error: null,
          ipAddress: data.ip
        });
      } catch (err) {
        console.error('Network check failed:', err);
        setNetworkStatus(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to check network status'
        }));
      }
    };

    checkNetwork();
  }, []);

  return networkStatus;
};

/**
 * Hook to determine access restrictions based on network and role
 * Returns: { canAccessRestricted, canAccessNormal, restrictions }
 */
export const useAccessControl = (userRole) => {
  const { isInsideNetwork, loading } = useNetworkStatus();

  const [accessControl, setAccessControl] = useState({
    canAccessRestricted: false,
    canAccessNormal: false,
    canAccessEmergency: false,
    isAdmin: false,
    restrictions: []
  });

  useEffect(() => {
    if (loading || isInsideNetwork === null) return;

    const isAdmin = userRole === 'admin';

    let canAccessRestricted = false;
    let canAccessNormal = false;
    let canAccessEmergency = false;
    let restrictions = [];

    if (isAdmin) {
      // Admin can access everything
      canAccessRestricted = true;
      canAccessNormal = true;
      canAccessEmergency = true;
    } else {
      // Non-admin users have restrictions based on network
      if (isInsideNetwork) {
        // Inside network: CAN access normal, CANNOT access restricted
        canAccessNormal = true;
        canAccessRestricted = false;
        restrictions.push('Restricted access is blocked when inside network');
      } else {
        // Outside network: CANNOT access normal, CAN access restricted
        canAccessNormal = false;
        canAccessRestricted = true;
        restrictions.push('Normal access is blocked when outside network');
      }

      // Emergency access available for doctors/nurses only
      if (userRole === 'doctor' || userRole === 'nurse') {
        canAccessEmergency = true;
      }
    }

    setAccessControl({
      canAccessRestricted,
      canAccessNormal,
      canAccessEmergency,
      isAdmin,
      restrictions
    });
  }, [isInsideNetwork, userRole, loading]);

  return accessControl;
};

/**
 * Hook to get button disabled state
 * Returns: { isDisabled, reason, cssClass }
 */
export const useButtonAccess = (accessType, userRole, isInsideNetwork) => {
  const isAdmin = userRole === 'admin';

  // Admin can always click buttons
  if (isAdmin) {
    return {
      isDisabled: false,
      reason: '',
      cssClass: 'access-allowed'
    };
  }

  // Non-admin logic
  if (accessType === 'normal') {
    // Normal access blocked when outside network
    if (isInsideNetwork === false) {
      return {
        isDisabled: true,
        reason: 'Normal access disabled outside network',
        cssClass: 'access-blocked-outside-network'
      };
    }
    return {
      isDisabled: false,
      reason: '',
      cssClass: 'access-allowed'
    };
  }

  if (accessType === 'restricted') {
    // Restricted access blocked when inside network
    if (isInsideNetwork === true) {
      return {
        isDisabled: true,
        reason: 'Restricted access disabled inside network',
        cssClass: 'access-blocked-inside-network'
      };
    }
    return {
      isDisabled: false,
      reason: '',
      cssClass: 'access-allowed'
    };
  }

  if (accessType === 'emergency') {
    // Emergency access - only for doctors/nurses
    if (userRole !== 'doctor' && userRole !== 'nurse' && !isAdmin) {
      return {
        isDisabled: true,
        reason: 'Emergency access only available to doctors and nurses',
        cssClass: 'access-restricted-role'
      };
    }
    return {
      isDisabled: false,
      reason: '',
      cssClass: 'access-allowed'
    };
  }

  return {
    isDisabled: false,
    reason: '',
    cssClass: 'access-allowed'
  };
};
