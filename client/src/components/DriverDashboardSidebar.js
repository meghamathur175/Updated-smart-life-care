import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "../styles/DriverDashboardSidebar.css";

const DriverDashboardSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button className="driver-toggle-button" onClick={toggleSidebar}>
        {sidebarOpen ? "\u2715" : "\u2630"} {/* ☰ = \u2630, × = \u2715 */}
      </button>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div className="driver-overlay active" onClick={closeSidebar}></div>
      )}

      <div className="driver-layout">
        {/* Sidebar */}
        <aside className={`driver-sidebar ${sidebarOpen ? "active" : ""}`}>
          <h2>Driver Dashboard</h2>
          <nav className="driver-nav">
            <Link className="driver-nav-link" to="/driver-dashboard" onClick={closeSidebar}>
              Home
            </Link>
            <Link className="driver-nav-link" to="/driver-dashboard/profile" onClick={closeSidebar}>
              Profile
            </Link>
            <Link className="driver-nav-link" to="/driver-dashboard/trips" onClick={closeSidebar}>
              Trips
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="driver-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default DriverDashboardSidebar;
