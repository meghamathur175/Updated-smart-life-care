import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/DriverDashboardSidebar.css";

const DriverDashboardSidebar = () => {
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
      <button className="driver-toggle-button" onClick={toggleSidebar}>
        {sidebarOpen ? "\u2715" : "\u2630"}
      </button>

      {sidebarOpen && (
        <div className="driver-overlay active" onClick={closeSidebar}></div>
      )}

      <div className="driver-layout">
        <aside className={`driver-sidebar ${sidebarOpen ? "active" : ""}`}>
          <h2>Driver Dashboard</h2>
          <nav className="driver-nav">
            <Link
              className="driver-nav-link"
              to="/driver-dashboard/profile"
              onClick={closeSidebar}
            >
              Profile
            </Link>
            <Link
              className="driver-nav-link"
              to="/driver-dashboard/trips"
              onClick={closeSidebar}
            >
              Trips
            </Link>
            <button
              className="driver-nav-link logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>
        </aside>

        <main className="driver-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default DriverDashboardSidebar;
