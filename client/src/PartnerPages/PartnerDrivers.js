import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/PartnerDrivers.css";

const PartnerDrivers = () => {
  const [partnerDrivers, setPartnerDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPartner = JSON.parse(localStorage.getItem("partner"));
    const partnerId = storedPartner?._id;

    if (!partnerId) {
      alert("Please log in as a partner to view drivers.");
      navigate("/partner-login");
      return;
    }

    const fetchPartnerDrivers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/partner-drivers/by-partner?partnerId=${partnerId}`
        );

        if (Array.isArray(res.data.drivers)) {
          setPartnerDrivers(res.data.drivers);
        } else {
          console.warn("Unexpected response format:", res.data);
          setPartnerDrivers([]);
        }
      } catch (err) {
        console.error("Failed to fetch partner drivers:", err);
        alert("Could not load drivers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerDrivers();
  }, [navigate]);

  const handleDelete = async (driverId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this driver?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:3001/api/partner-drivers/${driverId}`
      );
      alert("✅ Driver deleted successfully!");
      setPartnerDrivers((prev) => prev.filter((d) => d._id !== driverId));
    } catch (err) {
      console.error("Failed to delete driver:", err);
      alert("❌ Failed to delete driver.");
    }
  };

  const handleUpdate = (driver) => {
    navigate("/partner-dashboard/update-driver", { state: { driver } });
  };

  const buttonStyle = {
    minWidth: "80px",
    padding: "6px 12px",
    fontSize: "14px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "white",
  };

  return (
    <div className="partner-drivers-list">
      <h2>Registered Partner Drivers</h2>
      {loading ? (
        <p>Loading drivers...</p>
      ) : partnerDrivers.length === 0 ? (
        <p>No drivers registered yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Vehicle Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partnerDrivers.map((driver, index) => (
              <tr key={driver._id}>
                <td>{index + 1}</td>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>{driver.address}</td>
                <td>{driver.vehicleType}</td>
                <td>
                  <button
                    onClick={() => handleUpdate(driver)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#28a745",
                      marginRight: "8px",
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(driver._id)}
                    style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PartnerDrivers;
