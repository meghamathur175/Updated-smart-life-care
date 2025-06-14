import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/PartnerDashboardSidebar.css";
import axios from 'axios';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:3001/api/partners/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPartnerData(res.data);
      } catch (err) {
        console.error("Error fetching /me:", err);
        navigate("/partner-login");
      }
    };

    fetchPartnerData();
  }, [navigate]); 



  return (
    <>
      <button className="partner-toggle-button" onClick={toggleSidebar}>
        {sidebarOpen ? "\u2715" : "\u2630"}
      </button>

      {sidebarOpen && (
        <div className="partner-overlay active" onClick={closeSidebar}></div>
      )}

      <div className="partner-layout">
        <aside className={`partner-sidebar ${sidebarOpen ? "active" : ""}`}>
          <h2>Partner Dashboard</h2>
          <nav className="partner-nav">
            <Link className="partner-nav-link" to="/" onClick={closeSidebar}>
              Home
            </Link>
            <Link
              className="partner-nav-link"
              to="requests"
              onClick={closeSidebar}
            >
              Requests
            </Link>
            <Link
              className="partner-nav-link"
              to="tracking"
              onClick={closeSidebar}
            >
              Tracking
            </Link>
            <Link
              className="partner-nav-link"
              to="reports"
              onClick={closeSidebar}
            >
              Reports
            </Link>
            <Link
              className="partner-nav-link"
              to="payments"
              onClick={closeSidebar}
            >
              Payments
            </Link>
            <Link
              className="partner-nav-link"
              to="drivers"
              onClick={closeSidebar}
            >
              Register Driver
            </Link>
            <Link
              className="admin-nav-link"
              to="partner-drivers"
              onClick={closeSidebar}
            >
              Partner Drivers
            </Link>
            <button
              className="partner-nav-link logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>
        </aside>

        <main className="partner-content">
          <div className="welcome-container">
            <h1>Welcome to Partner Dashboard</h1>
          </div>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Layout;
