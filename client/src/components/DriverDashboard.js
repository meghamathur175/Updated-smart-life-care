import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DriverDashboard.css";

const DriverDashboard = () => {
  const [status, setStatus] = useState("Available");
  const [currentTrip, setCurrentTrip] = useState(null);
  const navigate = useNavigate();

  const toggleStatus = () => {
    setStatus((prev) => (prev === "Available" ? "On Duty" : "Available"));
  };

  const goToHome = () => {
    navigate("/");
  };

  return (
    <div className="driver-dashboard">
      <header className="dashboard-header">
        <h1>Driver Dashboard</h1>
        <div className="header-right">
          <button onClick={toggleStatus} className={`status-btn ${status.toLowerCase().replace(" ", "-")}`}>
            {status}
          </button>
          <button onClick={goToHome} className="home-btn">
            Home
          </button>
        </div>
      </header>

      <section className="current-trip">
        <h2>Current Ambulance Trip</h2>
        {currentTrip ? (
          <div>
            <p><strong>Pickup:</strong> {currentTrip.pickup}</p>
            <p><strong>Drop-off:</strong> {currentTrip.dropoff}</p>
            <p><strong>Status:</strong> {currentTrip.status}</p>
          </div>
        ) : (
          <p>No active trips</p>
        )}
      </section>

      <section className="trip-history">
        <h2>Trip History</h2>
        <ul>
          <li>Trip 1: Downtown to City Hospital</li>
          <li>Trip 2: Uptown to Central Clinic</li>
          <li>Trip 3: Westside to Mercy Hospital</li>
        </ul>
      </section>
    </div>
  );
};

export default DriverDashboard;
