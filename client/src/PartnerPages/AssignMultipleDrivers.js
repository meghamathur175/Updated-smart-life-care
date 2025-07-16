import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AssignMultipleDrivers.css";

function AssignMultipleDrivers() {
  const location = useLocation();
  const navigate = useNavigate();
  const { requestId, requestData, partnerId } = location.state || {};
  const [drivers, setDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPartnerDrivers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3001/api/partners/${partnerId}/drivers`);
      const allDrivers = res.data || [];

      // ✅ Filter drivers by requested ambulance type
      const filtered = allDrivers.filter(
        (d) => d.vehicleType === requestData.ambulanceType
      );

      setDrivers(filtered);
    } catch (err) {
      console.error("Failed to fetch drivers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId && requestData?.ambulanceType) {
      fetchPartnerDrivers();
    }
  }, [partnerId, requestData]);

  const handleDriverToggle = (driver) => {
    const isSelected = selectedDrivers.find((d) => d.driverId === driver._id);
    if (isSelected) {
      setSelectedDrivers((prev) => prev.filter((d) => d.driverId !== driver._id));
    } else {
      setSelectedDrivers((prev) => [
        ...prev,
        {
          driverId: driver._id,
          plateNumber: driver.plateNumber,
        },
      ]);
    }
  };

  const handleSubmit = async () => {
    if (selectedDrivers.length === 0) return alert("Please select at least one ambulance.");
    setSubmitting(true);
    try {
      await axios.post("http://localhost:3001/api/partners/assign-multiple-drivers", {
        bookingId: requestId,
        partnerId,
        ambulances: selectedDrivers,
      });

      alert("🚑 Ambulances assigned successfully.");
      navigate("/partner-dashboard/requests");
    } catch (err) {
      console.error("❌ Failed to assign ambulances:", err.message);
      alert("Failed to assign ambulances.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="assign-driver-container">
      <h2>Assign Ambulances for Booking: {requestId}</h2>

      <div className="request-summary">
        <p><strong>Patient:</strong> {requestData?.userName}</p>
        <p><strong>Pickup:</strong> {requestData?.pickup}</p>
        <p><strong>Required Type:</strong> {requestData?.ambulanceType}</p>
        <p><strong>Urgency:</strong> {requestData?.urgency}</p>
      </div>

      {loading ? (
        <p>Loading drivers...</p>
      ) : drivers.length === 0 ? (
        <p>No available ambulances match the required type: <b>{requestData?.ambulanceType}</b></p>
      ) : (
        <div className="drivers-list">
          {drivers.map((driver) => {
            const isSelected = selectedDrivers.find((d) => d.driverId === driver._id);
            return (
              <div
                key={driver._id}
                className={`driver-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleDriverToggle(driver)}
              >
                <p><strong>{driver.name}</strong></p>
                <p>Ambulance No: {driver.plateNumber}</p>
                <p>Phone: {driver.contactNumber}</p>
                <p>Type: {driver.vehicleType}</p>
              </div>
            );
          })}
        </div>
      )}

      <button
        className="btn assign-final"
        onClick={handleSubmit}
        disabled={submitting || selectedDrivers.length === 0}
      >
        {submitting ? "Assigning..." : `Assign ${selectedDrivers.length} Ambulance(s)`}
      </button>
    </div>
  );
}

export default AssignMultipleDrivers;
