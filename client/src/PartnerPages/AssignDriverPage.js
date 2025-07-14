import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import '../styles/AssignDriverPage.js.css';

const AssignDriver = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const partnerId = localStorage.getItem('partnerId');
  const token = localStorage.getItem("partnerToken");

  const location = useLocation();
  const requestData = location.state?.requestData;
  const requestId = location.state?.requestId;

  useEffect(() => {
    if (!partnerId || !requestData?.ambulanceType) return;
    fetchFilteredDrivers(requestData.ambulanceType);
  }, [partnerId, requestData]);

  const fetchFilteredDrivers = async (ambulanceType) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/partner-drivers/by-partner`, {
        params: { partnerId }
      });

      const available = res.data.drivers.filter(
        (d) => d.available && d.vehicleType === ambulanceType
      );

      setDrivers(available);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  const fetchLatestRequestStatus = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/partners/partner-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const latest = res.data.find(r => r.bookingId === requestId);
      console.log("Latest request data: ", latest);
      return latest?.status?.toLowerCase();
    } catch (err) {
      console.error("Failed to fetch latest request status:", err);
      return null;
    }
  };

  const handleAssignDriver = async (driverId) => {
    if (!requestId || !driverId) {
      alert("Missing request or driver ID");
      return;
    }

    const latestStatus = await fetchLatestRequestStatus();
    if (latestStatus.toLowerCase() !== "accepted") {
      alert("⚠️ Request is not yet Accepted. Please try again in a few seconds.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post('http://localhost:3001/api/partner-drivers/assign-driver', {
        partnerId,
        requestId,
        driverId,
      });

      if (response.status === 200 || response.status === 201) {
        alert('✅ Driver assigned successfully!');
        navigate('/partner-dashboard/requests');
      } else {
        alert('⚠️ Unexpected server response.');
      }
    } catch (err) {
      alert('❌ Failed to assign driver.');
      console.error('Error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-driver-container">
      <h2>🚑 Assign Driver</h2>

      <div className="request-card">
        <p><strong>Patient:</strong> {requestData?.userName}</p>
        <p><strong>Pickup:</strong> {requestData?.pickup}</p>
        <p><strong>Ambulance Type:</strong> {requestData?.ambulanceType}</p>
        <p><strong>Urgency:</strong> {requestData?.urgency}</p>
      </div>

      <div className="driver-selection">
        <h3>Available Drivers ({requestData?.ambulanceType})</h3>
        {drivers.length === 0 ? (
          <p>No drivers available with this ambulance type.</p>
        ) : (
          <ul>
            {drivers.map((driver) => (
              <li key={driver._id}>
                <strong>{driver.name}</strong> ({driver.vehicleType}) - {driver.ambulancePlateNumber}
                <button onClick={() => handleAssignDriver(driver._id)} disabled={loading}>
                  {loading ? "Assigning..." : "Assign"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssignDriver;
