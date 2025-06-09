import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate
import "../styles/PartnerDriversForm.css";

const PartnerDriversForm = () => {
  const navigate = useNavigate(); // <-- initialize useNavigate

  const [formData, setFormData] = useState({
    hospitalName: "",
    name: "",
    phone: "",
    address: "",
    vehicleType: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3001/api/partner-drivers", formData);
      setSuccessMessage("Driver registered successfully!");
      setError("");
      alert("✅ Driver registered successfully!");
      setFormData({
        hospitalName: "",
        name: "",
        phone: "",
        address: "",
        vehicleType: "",
      });

      // Navigate to partner-dashboard after successful registration
      navigate("/partner-dashboard");
    } catch (err) {
      console.error("Failed to register driver:", err);
      setError("❌ Failed to register driver.");
      setSuccessMessage("");
      alert("❌ Failed to register driver. Please try again.");
    }
  };

  return (
    <div className="partner-driver-form">
      <h2>Register a New Driver</h2>
      {successMessage && <p className="success-msg">{successMessage}</p>}
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit} autoComplete="off">
        <input
          name="hospitalName"
          placeholder="Hospital Name"
          value={formData.hospitalName}
          onChange={handleChange}
          required
        />
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
