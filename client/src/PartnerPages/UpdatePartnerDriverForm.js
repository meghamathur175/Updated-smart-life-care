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
    ambulancePlateNumber: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [ambulanceOptions, setAmbulanceOptions] = useState([]);

  // Fetch ambulance types
  useEffect(() => {
    const fetchAmbulanceTypes = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/ambulance-types");
        const data = await res.json();

        if (res.ok) {
          setAmbulanceOptions(data);
        } else {
          console.error("Error fetching ambulance types:", data.message);
        }
      } catch (err) {
        console.error("Error fetching ambulance types:", err);
      }
    };

    fetchAmbulanceTypes();
  }, []);

  useEffect(() => {
    if (!driver) {
      setError("❌ No driver data found for update.");
      return;
    }

    setFormData({
      name: driver.name.trim() || "",
      phone: driver.phone.trim() || "",
      address: driver.address.trim() || "",
      vehicleType: driver.vehicleType.trim() || "",
      ambulancePlateNumber: driver.ambulancePlateNumber.trim() || "NOT AVAILABLE",
    });
  }, [driver]);

  const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim all form values before validation and submission
    const trimmedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, val]) => [key, typeof val === "string" ? val.trim() : val])
    );

    if (!validatePhoneNumber(trimmedFormData.phone)) {
      setError("❌ Invalid phone number. Please enter a 10-digit number.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3001/api/partner-drivers/${driver._id}`,
        trimmedFormData
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
        <input
          name="ambulancePlateNumber"
          placeholder="Ambulance Plate Number"
          value={formData.ambulancePlateNumber}
          onChange={handleChange}
          required
        />
        <select
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          required
        >
          <option value="">Select Vehicle Type</option>
          {ambulanceOptions.map((option, index) => (
            <option key={index} value={option.type}>
              {option.type} - ₹{option.price}
            </option>
          ))}
        </select>
        <button type="submit">Update Driver</button>
      </form>
    </div>
  );
};

export default UpdatePartnerDriverForm;
