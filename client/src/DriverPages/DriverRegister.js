import React, { useState, useEffect } from "react";
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
    ambulancePlateNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ambulanceOptions, setAmbulanceOptions] = useState([]);
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  const plateRegex = /^[A-Z]{2}\d{2}\s?[A-Z]{1,2}\s?\d{4}$/; // Example: RJ14 AB 1234

  const formatLicense = (input) => {
    const cleaned = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const part1 = cleaned.slice(0, 4); // MH14
    const part2 = cleaned.slice(4, 8); // 2025
    const part3 = cleaned.slice(8, 15); // 1234567
    return [part1, part2, part3].filter(Boolean).join(" ");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === "licenseNumber") {
      setFormData({ ...formData, [name]: formatLicense(value) });
    } else if (name === "password") {
      setFormData({ ...formData, [name]: value });

      if (!strongPasswordRegex.test(value)) {
        setPasswordError(
          "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character."
        );
      } else if (name === "ambulancePlateNumber") {
        const formatted = value.toUpperCase().replace(/[^A-Z0-9\s]/g, "");
        setFormData({ ...formData, [name]: formatted });
      } else {
        setPasswordError("");
      }
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

    if (!formData.password || !strongPasswordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be 8 characters, include 1 uppercase letter, 1 number & 1 special character.";
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

    if (!formData.ambulancePlateNumber || !plateRegex.test(formData.ambulancePlateNumber)) {
      newErrors.ambulancePlateNumber = "Valid ambulance plate number is required (e.g., RJ14 AB 1234)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        ].map(({ label, name, type }) => (
          <div className="form-group" key={name}>
            <label className="form-label" htmlFor={name}>
              {label}
            </label>
            <input
              className={`form-control ${errors[name] ? "error-input" : ""}`}
              type={type}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {errors[name] && <small className="error">{errors[name]}</small>}
          </div>
        ))}

        {/* License Number*/}
        <div className="form-group">
          <label className="form-label" htmlFor="licenseNumber">License Number</label>
          <input
            className={`form-control ${errors.licenseNumber ? "error-input" : ""}`}
            type="text"
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) =>
              setFormData({ ...formData, licenseNumber: e.target.value })
            }
            onBlur={(e) =>
              setFormData({ ...formData, licenseNumber: formatLicense(e.target.value) })
            }
            placeholder="e.g., MH14 2025 1234567"
            required
            disabled={loading}
          />

          {errors.licenseNumber && <small className="error">{errors.licenseNumber}</small>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            Phone
          </label>
          <input
            className={`form-control ${errors.phone ? "error-input" : ""}`}
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
            disabled={loading}
          />
          {errors.phone && <small className="error">{errors.phone}</small>}
        </div>

        {/* Password */}
        <div className="form-group password-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <div className="password-wrapper">
            <input
              className={`form-control ${errors.password || passwordError ? "error-input" : ""}`}
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <i className="fa fa-eye-slash" aria-hidden="true"></i>
              ) : (
                <i className="fa fa-eye" aria-hidden="true"></i>
              )}
            </span>
          </div>
          {passwordError && <small className="error">{passwordError}</small>}
        </div>

        {/* Ambulance Plate Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="ambulancePlateNumber">
            Ambulance Plate Number
          </label>
          <input
            className={`form-control ${errors.ambulancePlateNumber ? "error-input" : ""}`}
            type="text"
            id="ambulancePlateNumber"
            name="ambulancePlateNumber"
            value={formData.ambulancePlateNumber}
            onChange={handleChange}
            placeholder="e.g., RJ14 AB 1234"
            required
            disabled={loading}
          />
          {errors.ambulancePlateNumber && (
            <small className="error">{errors.ambulancePlateNumber}</small>
          )}
        </div>

        {/* Vehicle Type */}
        <div className="form-group">
          <label className="form-label" htmlFor="vehicleType">
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            name="vehicleType"
            className={`form-control ${errors.vehicleType ? "error-input" : ""}`}
            value={formData.vehicleType}
            onChange={(e) =>
              setFormData({ ...formData, vehicleType: e.target.value })
            }
            required
            disabled={loading}
          >
            <option value="">Select Vehicle Type</option>
            {ambulanceOptions.map((option, index) => (
              <option key={index} value={option.type}>
                {option.type} - ₹{option.price}
              </option>
            ))}
          </select>
          {errors.vehicleType && (
            <small className="error">{errors.vehicleType}</small>
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
