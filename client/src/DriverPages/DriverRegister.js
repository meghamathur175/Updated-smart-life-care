import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DriverAuth.css";

const DriverRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
    phone: "",
    licenseNumber: "",
    vehicleType: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const formatLicense = (input) => {
    // Remove all non-alphanumeric characters
    const cleaned = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    let part1 = cleaned.slice(0, 4); // MH14
    let part2 = cleaned.slice(4, 8); // 2025
    let part3 = cleaned.slice(8, 15); // 1234567

    let formatted = "";
    if (part1) formatted += part1;
    if (part2) formatted += " " + part2;
    if (part3) formatted += " " + part3;

    return formatted.trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === "licenseNumber") {
      setFormData({ ...formData, [name]: formatLicense(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phoneRegex = /^\d{10}$/;
    const licenseRegex = /^[A-Z]{2}\d{2}\s\d{4}\s\d{7}$/;

    if (!formData.firstName || !nameRegex.test(formData.firstName)) {
      newErrors.firstName = "Valid first name is required";
    }

    if (!formData.lastName || !nameRegex.test(formData.lastName)) {
      newErrors.lastName = "Valid last name is required";
    }

    if (!formData.age || formData.age < 18 || formData.age > 65) {
      newErrors.age = "Age must be between 18 and 65";
    }

    if (!formData.email || !gmailRegex.test(formData.email)) {
      newErrors.email = "Valid Gmail is required";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (!formData.licenseNumber || !licenseRegex.test(formData.licenseNumber)) {
      newErrors.licenseNumber = "License must be in format: MH14 2025 1234567";
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = "Vehicle type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/drivers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 201 && data.status === "success") {
        localStorage.setItem("driver", JSON.stringify(data.driver));
        localStorage.setItem("driverToken", data.token);
        alert("Registration successful!");
        navigate("/driver-dashboard", { replace: true });
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="driver-login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Driver Registration</h2>

        {[
          { label: "First Name", name: "firstName", type: "text" },
          { label: "Last Name", name: "lastName", type: "text" },
          { label: "Age", name: "age", type: "number" },
          { label: "Email", name: "email", type: "email" },
          { label: "License Number", name: "licenseNumber", type: "text" },
        ].map(({ label, name, type }) => (
          <div className="form-group" key={name}>
            <label className="form-label" htmlFor={name}>
              {label}
            </label>
            <input
              className="form-control"
              type={type}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
            />
            {errors[name] && <span className="error">{errors[name]}</span>}
          </div>
        ))}

        {/* Phone */}
        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            Phone
          </label>
          <input
            className="form-control"
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onKeyDown={(e) => {
              const allowedKeys = [
                "Backspace",
                "Tab",
                "ArrowLeft",
                "ArrowRight",
                "Delete",
              ];
              if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                e.preventDefault();
              }
            }}
            maxLength={10}
            required
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        {/* Password */}
        <div className="form-group password-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            className="form-control"
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            role="button"
          >
            {showPassword ? (
              <i className="fa fa-eye-slash" aria-hidden="true"></i>
            ) : (
              <i className="fa fa-eye" aria-hidden="true"></i>
            )}
          </span>
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        {/* Vehicle Type */}
        <div className="form-group">
          <label className="form-label" htmlFor="vehicleType">
            Vehicle Type
          </label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            required
          >
            <option value="">Select Vehicle Type</option>
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
          {errors.vehicleType && (
            <span className="error">{errors.vehicleType}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary full-width"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default DriverRegister;
