import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_URL } from "../api";
import { useNavigate } from "react-router-dom";
import AnalyticsCharts from "./AnalyticsCharts";
import NotificationCenter from "./NotificationCenter";
import ReportExport from "./ReportExport";
import PermissionsEditor from "./PermissionsEditor";
import AdminSidebar from "./admin/AdminSidebar";
import UserManagement from "./admin/UserManagement";
import UsersList from "./admin/UsersList";
import PatientList from "./admin/PatientList";
import SystemLogs from "./admin/SystemLogs";
import DoctorLogs from "./admin/DoctorLogs";
import NurseLogs from "./admin/NurseLogs";
import FlaggedEvents from "./admin/FlaggedEvents";
import "../css/AdminDashboard.css";
import "../css/Notifications.css";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "🔐 Token attached to request:",
        token.substring(0, 20) + "..."
      );
    } else {
      console.warn("⚠️ No admin token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ Unauthorized (401). Clearing token and redirecting...");
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [doctorLogs, setDoctorLogs] = useState([]);
  const [nurseLogs, setNurseLogs] = useState([]);
  const [patients, setPatients] = useState([]);

  const usersRef = useRef(users);
  const systemLogsRef = useRef(systemLogs);
  const doctorLogsRef = useRef(doctorLogs);
  const nurseLogsRef = useRef(nurseLogs);
  const patientsRef = useRef(patients);

  const isFetchingUsers = useRef(false);
  const isFetchingSystemLogs = useRef(false);
  const isFetchingDoctorLogs = useRef(false);
  const isFetchingNurseLogs = useRef(false);
  const isFetchingPatients = useRef(false);

  const hasLoadedUsers = useRef(false);
  const hasLoadedSystemLogs = useRef(false);
  const hasLoadedDoctorLogs = useRef(false);
  const hasLoadedNurseLogs = useRef(false);
  const hasLoadedPatients = useRef(false);
  
  useEffect(() => { usersRef.current = users; }, [users]);
  useEffect(() => { systemLogsRef.current = systemLogs; }, [systemLogs]);
  useEffect(() => { doctorLogsRef.current = doctorLogs; }, [doctorLogs]);
  useEffect(() => { nurseLogsRef.current = nurseLogs; }, [nurseLogs]);
  useEffect(() => { patientsRef.current = patients; }, [patients]);

  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async (force = false) => {
    if (isFetchingUsers.current) return;
    if (!force && hasLoadedUsers.current) return;
    
    isFetchingUsers.current = true;
    try {
      setLoading(true);
      const res = await apiClient.get("/get_all_users");
      if (res.data.success) {
        setUsers(res.data.users || []);
        hasLoadedUsers.current = true;
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    } finally {
      isFetchingUsers.current = false;
      setLoading(false);
    }
  }, [navigate]);

  const fetchSystemLogs = useCallback(async (force = false) => {
    if (isFetchingSystemLogs.current) return;
    if (!force && hasLoadedSystemLogs.current) return;

    isFetchingSystemLogs.current = true;
    try {
      const res = await apiClient.get("/access_logs/admin");
      if (res.data.success) {
         setSystemLogs(res.data.logs || []);
         hasLoadedSystemLogs.current = true;
      }
    } catch (error) {
      console.error("❌ Error fetching system logs:", error);
    } finally {
      isFetchingSystemLogs.current = false;
    }
  }, []);

  const fetchDoctorLogs = useCallback(async (force = false) => {
    if (isFetchingDoctorLogs.current) return;
    if (!force && hasLoadedDoctorLogs.current) return;

    isFetchingDoctorLogs.current = true;
    try {
      const res = await apiClient.get("/all_doctor_access_logs");
      if (res.data.success) {
        setDoctorLogs(res.data.logs || []);
        hasLoadedDoctorLogs.current = true;
      }
    } catch (error) {
      console.error("❌ Error fetching doctor logs:", error);
    } finally {
      isFetchingDoctorLogs.current = false;
    }
  }, []);

  const fetchNurseLogs = useCallback(async (force = false) => {
    if (isFetchingNurseLogs.current) return;
    if (!force && hasLoadedNurseLogs.current) return;

    isFetchingNurseLogs.current = true;
    try {
      const res = await apiClient.get("/all_nurse_access_logs");
      if (res.data.success) {
        setNurseLogs(res.data.logs || []);
        hasLoadedNurseLogs.current = true;
      }
    } catch (error) {
      console.error("❌ Error fetching nurse logs:", error);
    } finally {
      isFetchingNurseLogs.current = false;
    }
  }, []);

  const fetchPatients = useCallback(async (force = false) => {
    if (isFetchingPatients.current) return;
    if (!force && hasLoadedPatients.current) return;

    isFetchingPatients.current = true;
    try {
      const res = await apiClient.get("/all_patients");
      if (res.data.success) {
        setPatients(res.data.patients || []);
        hasLoadedPatients.current = true;
      }
    } catch (error) {
      console.error("❌ Error fetching patients:", error);
    } finally {
      isFetchingPatients.current = false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setTimeout(() => navigate("/admin/login"), 100);
      return;
    }

    if (activeTab === "users" || activeTab === "userManagement") fetchUsers();

    if (
      activeTab === "systemLogs" ||
      activeTab === "analytics" ||
      activeTab === "flagged"
    )
      fetchSystemLogs();
    if (activeTab === "doctorLogs" || activeTab === "analytics")
      fetchDoctorLogs();
    if (activeTab === "nurseLogs" || activeTab === "analytics")
      fetchNurseLogs();
    if (activeTab === "patients") fetchPatients();

    if (activeTab === "analytics" || activeTab === "reports") {
      fetchUsers();
      fetchSystemLogs();
      fetchDoctorLogs(true); 
      fetchNurseLogs();
      fetchPatients();
    }

    fetchDoctorLogs(); 
    const notificationInterval = setInterval(() => fetchDoctorLogs(true), 40000);
    
    return () => clearInterval(notificationInterval);
  }, [
    activeTab,
    fetchUsers,
    fetchSystemLogs,
    fetchDoctorLogs,
    fetchNurseLogs,
    fetchPatients,
    navigate,
  ]);

  const handleLogout = () => {
    if (onLogout) onLogout();
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="admin-layout">
      {}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        usersCount={users.length}
        onLogout={handleLogout}
      />

      {}
      <main className="admin-main">
        {}
        <header className="admin-header">
          <div className="header-left">
            <h1>Pages / Dashboard</h1>
            <p className="current-page-title">
              {activeTab === "users"
                ? "Admin Dashboard"
                : activeTab === "userManagement"
                ? "User Management"
                : activeTab === "systemLogs"
                ? "System Logs"
                : activeTab === "analytics"
                ? "Analytics"
                : "Overview"}
            </p>
          </div>
          <div className="header-right">
            <NotificationCenter logs={doctorLogs} />
          </div>
        </header>

        {}
        {activeTab === "userManagement" && (
          <UserManagement
            users={users}
            fetchUsers={fetchUsers}
            loading={loading}
            fetchPatients={fetchPatients}
          />
        )}

        {activeTab === "users" && (
          <UsersList users={users} fetchUsers={fetchUsers} loading={loading} />
        )}

        {activeTab === "patients" && (
          <PatientList
            patients={patients}
            fetchPatients={fetchPatients}
            loading={loading}
          />
        )}

        {activeTab === "systemLogs" && (
          <SystemLogs
            logs={systemLogs}
            fetchLogs={fetchSystemLogs}
            loading={loading}
          />
        )}

        {activeTab === "doctorLogs" && (
          <DoctorLogs
            logs={doctorLogs}
            fetchLogs={fetchDoctorLogs}
            loading={loading}
          />
        )}

        {activeTab === "nurseLogs" && (
          <NurseLogs
            logs={nurseLogs}
            fetchLogs={fetchNurseLogs}
            loading={loading}
          />
        )}

        {activeTab === "analytics" && (
          <section className="admin-scrollable-container">
            <div className="admin-section-header">
              <h2>📊 Advanced Analytics & Charts</h2>
            </div>
            <AnalyticsCharts
              logs={systemLogs}
              users={users}
              doctorLogs={doctorLogs}
              nurseLogs={nurseLogs}
              patients={patients}
            />
          </section>
        )}

        {activeTab === "reports" && (
          <section className="admin-scrollable-container">
            <div className="admin-section-header">
              <h2>📥 Export Reports</h2>
            </div>
            <ReportExport
              data={{ logs: systemLogs, users: users, doctorLogs: doctorLogs }}
            />
          </section>
        )}

        {activeTab === "permissions" && (
          <section className="admin-scrollable-container">
            <div className="admin-section-header">
              <h2>🔐 Role-Based Permissions</h2>
            </div>
            <PermissionsEditor />
          </section>
        )}

        {activeTab === "flagged" && (
          <FlaggedEvents
            logs={systemLogs}
            fetchLogs={fetchSystemLogs}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
