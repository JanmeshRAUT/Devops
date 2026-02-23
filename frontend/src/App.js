import React, { useState, useEffect } from "react";
import useIdleTimer from "./hooks/useIdleTimer";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminLogin from "./components/AdminLogin";
import DoctorDashboard from "./components/DoctorDashboard";
import NurseDashboard from "./components/NurseDashboard";
import PatientDashboard from "./components/PatientDashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSessionTimeout = () => {
    if (user || adminToken) {
      alert("⚠️ Session expired due to inactivity. Please login again.");
      handleLogout();
      handleAdminLogout();
    }
  };

  useIdleTimer(300000, handleSessionTimeout, !!(user || adminToken));

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedAdminToken = localStorage.getItem("adminToken");
    const savedAdminUser = localStorage.getItem("adminUser"); 
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("user");
      }
    }

    if (savedAdminToken) {
      setAdminToken(savedAdminToken);
    }

    setLoading(false);
  }, []);

  const handleLogin = (role, name) => {
    const userData = { name, role };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleAdminLogin = (token) => {
    setAdminToken(token);
    localStorage.setItem("adminToken", token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem("adminToken");
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "1.2rem",
        color: "#64748b"
      }}>
        Loading...
      </div>
    );
  }

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }
    if (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const AdminProtectedRoute = ({ children }) => {
    if (!adminToken) {
      return <Navigate to="/admin" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {}
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate 
                to={`/${user.role.toLowerCase()}`}
                replace 
              />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        
        {}
        <Route 
          path="/admin" 
          element={
            adminToken ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          } 
        />

        {}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard 
                user={{ name: "Admin", role: "admin" }} 
                onLogout={handleAdminLogout} 
              />
            </AdminProtectedRoute>
          } 
        />
        
        {}
        <Route 
          path="/doctor" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        {}
        <Route 
          path="/nurse" 
          element={
            <ProtectedRoute requiredRole="nurse">
              <NurseDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        {}
        <Route 
          path="/patient" 
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientDashboard user={user} onBack={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
