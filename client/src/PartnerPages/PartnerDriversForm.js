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
    ambulancePlateNumber: "",
  });

  const [partnerId, setPartnerId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [ambulanceOptions, setAmbulanceOptions] = useState([]);

  // Check if partner is logged in
  useEffect(() => {
    const storedPartner = JSON.parse(localStorage.getItem("partner"));
    if (!storedPartner?._id) {
      setError("❌ Access denied. Please log in as a partner.");
      navigate("/partner-login");
    } else {
      setPartnerId(storedPartner._id);
    }
  }, [navigate]);

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

  // Validate phone number
  const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test(phone);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  // Handle form submit
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
      const driverData = { ...trimmedFormData, partnerId };

      const response = await axios.post("http://localhost:3001/api/partner-drivers", driverData);

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
        ambulancePlateNumber: "",
      });

      navigate("/partner-dashboard/partner-drivers");
    } catch (err) {
      console.error("Driver registration failed:", err);
      setError(err.response?.data?.message || "❌ Failed to register driver.");
      setSuccessMessage("");
      alert("❌ Failed to register driver. Please try again.");
    }
  };

  // Show error message if no partner
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

        <button type="submit">Register Driver</button>
      </form>
    </div>
  );
};

export default PartnerDriversForm;
