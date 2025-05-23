import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "../styles/PartnerDashboardSidebar.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <button className="partner-toggle-button" onClick={toggleSidebar}>
        {sidebarOpen ? "\u2715" : "\u2630"} {/* ☰ = \u2630, × = \u2715 */}
      </button>

      {sidebarOpen && <div className="partner-overlay active" onClick={closeSidebar}></div>}

      <div className="partner-layout">
        <aside className={`partner-sidebar ${sidebarOpen ? "active" : ""}`}>
          <h2>Partner Dashboard</h2>
          <nav className="partner-nav">
            <Link className="partner-nav-link" to="/" onClick={closeSidebar}> Home</Link>
            <Link className="partner-nav-link" to="requests" onClick={closeSidebar}> Requests</Link>
            <Link className="partner-nav-link" to="tracking" onClick={closeSidebar}> Tracking</Link>
            <Link className="partner-nav-link" to="reports" onClick={closeSidebar}> Reports</Link>
            <Link className="partner-nav-link" to="payments" onClick={closeSidebar}> Payments</Link>
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
