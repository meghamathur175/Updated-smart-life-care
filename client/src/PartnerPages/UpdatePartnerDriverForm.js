import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/PartnerDriversForm.css";

const UpdatePartnerDriverForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { driver } = location.state || {};

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    vehicleType: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!driver) {
      setError("❌ No driver data found for update.");
      return;
    }

    setFormData({
      name: driver.name || "",
      phone: driver.phone || "",
      address: driver.address || "",
      vehicleType: driver.vehicleType || "",
    });
  }, [driver]);

  const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(formData.phone)) {
      setError("❌ Invalid phone number. Please enter a 10-digit number.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3001/api/partner-drivers/${driver._id}`,
        formData
      );

      setSuccessMessage("✅ Driver updated successfully!");
      setError("");
      alert("✅ Driver updated successfully!");
      navigate("/partner-dashboard/partner-drivers");
    } catch (err) {
      console.error("Driver update failed:", err);
      setError(err.response?.data?.message || "❌ Failed to update driver.");
      setSuccessMessage("");
    }
  };

  if (!driver) return <p className="error-msg">{error}</p>;

  return (
    <div className="partner-driver-form">
      <h2>Update Driver Details</h2>
      {successMessage && <p className="success-msg">{successMessage}</p>}
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} autoComplete="off">
        <input
          name="name"
          placeholder="Driver Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <select
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          required
        >
          <option value="">Select ambulance type</option>
          <option value="Basic Life Support (BLS)">
            Basic Life Support (BLS)
          </option>
          <option value="Advanced Life Support (ALS)">
            Advanced Life Support (ALS)
          </option>
          <option value="Patient Transport Ambulance (PTA)">
            Patient Transport Ambulance (PTA)
          </option>
          <option value="Neonatal Ambulance">Neonatal Ambulance</option>
          <option value="Mortuary Ambulance">Mortuary Ambulance</option>
          <option value="Air Ambulance">Air Ambulance</option>
          <option value="Water Ambulance">Water Ambulance</option>
          <option value="4x4 Ambulance">4x4 Ambulance</option>
          <option value="ICU Ambulance">ICU Ambulance</option>
          <option value="Cardiac Ambulance">Cardiac Ambulance</option>
        </select>
        <button type="submit">Update Driver</button>
      </form>
    </div>
  );
};

export default UpdatePartnerDriverForm;
