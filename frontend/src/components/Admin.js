import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api";
import { useNavigate } from "react-router-dom";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("doctor");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("Unauthorized! Please login as Admin.");
      navigate("/admin/login");
    } else {
      fetchUsers(token);
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err);
    }
  };

  const handleAssignRole = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("Session expired. Please login again.");
      navigate("/admin/login");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/assign_role`,
        { name, email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message || "Role assigned");
      setName("");
      setEmail("");
      fetchUsers(token);
    } catch (error) {
      alert(error.response?.data?.error || "Error assigning role");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="admin-main">
      <header className="admin-header">
        <div className="header-left">
          <div className="current-page-title">MedTrust AI</div>
          <div className="header-sub">Admin Panel</div>
        </div>
        <div>
          <button className="med-btn med-btn-outline logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-section">
        <div className="admin-section-header">
          <h2>Assign Role to User</h2>
          <p className="section-description">Quickly assign roles to registered users.</p>
        </div>

        <div className="admin-content-area">
          <div className="role-box">
            <input
              className="med-search-input"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="med-search-input"
              type="email"
              placeholder="User Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <select
              className="med-date-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="patient">Patient</option>
              <option value="admin">Admin</option>
            </select>

            <button className="med-btn med-btn-primary" onClick={handleAssignRole}>
              Assign Role
            </button>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <div className="admin-section-header" style={{borderBottom: 'none'}}>
            <h2>Registered Users</h2>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Trust Score</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u, i) => (
                    <tr key={i}>
                      <td>
                        <div className="user-name">{u.name}</div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-${(u.role || 'patient')}`}>{(u.role || '-')}</span>
                      </td>
                      <td>{u.trust_score ?? '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-users">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
