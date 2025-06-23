import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/AdminDashboardSidebar.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <button className="admin-toggle-button" onClick={toggleSidebar}>
        {sidebarOpen ? "\u2715" : "\u2630"}
      </button>

      {sidebarOpen && (
        <div className="admin-overlay active" onClick={closeSidebar}></div>
      )}

      <div className="adminLayout">
        <aside className={`admin_sidebar ${sidebarOpen ? "active" : ""}`}>
          <h2>Admin Dashboard</h2>

          <nav className="admin-nav">
            <Link className="admin-nav-link" to="/" onClick={closeSidebar}>
              Home
            </Link>
            <Link
              className="admin-nav-link"
              to="partner-onbording"
              onClick={closeSidebar}
            >
              Partner Onboarding
            </Link>
            <Link
              className="admin-nav-link"
              to="commission-management"
              onClick={closeSidebar}
              
            >
              Commission Management
            </Link>
            <Link
              className="admin-nav-link"
              to="admin-reports"
              onClick={closeSidebar}
            >
              Reports
            </Link>
            <Link
              className="admin-nav-link"
              to="individual-drivers"
              onClick={closeSidebar}
            >
              Individual Drivers
            </Link>
            <button
              className="admin-nav-link logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>
        </aside>

        <main className="admin-content">
          <div className="welcome-container">
            <h1>Welcome to Admin Dashboard</h1>
          </div>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Layout;
