import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/PartnerDriversForm.css";

const PartnerDriversForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    vehicleType: "",
  });
  const [partnerId, setPartnerId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const storedPartner = JSON.parse(localStorage.getItem("partner"));
    if (!storedPartner?._id) {
      setError("❌ Access denied. Please log in as a partner.");
      navigate("/partner-login");
    } else {
      setPartnerId(storedPartner._id);
    }
  }, [navigate]);

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
      const driverData = { ...formData, partnerId };
      const response = await axios.post(
        "http://localhost:3001/api/partner-drivers",
        driverData
      );

      setSuccessMessage(
        response.data.message || "✅ Driver registered successfully!"
      );
      setError("");
      alert("✅ Driver registered successfully!");
      setFormData({
        name: "",
        phone: "",
        address: "",
        vehicleType: "",
      });
      navigate("/partner-dashboard/partner-drivers");
    } catch (err) {
      console.error("Driver registration failed:", err);
      setError(err.response?.data?.message || "❌ Failed to register driver.");
      setSuccessMessage("");
      alert("❌ Failed to register driver. Please try again.");
    }
  };

  if (!partnerId) return <p className="error-msg">{error}</p>;

  return (
    <div className="partner-driver-form">
      <h2>Add New Driver</h2>
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
          autoComplete="off"
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
        <button type="submit">Register Driver</button>
      </form>
    </div>
  );
};

export default PartnerDriversForm;
