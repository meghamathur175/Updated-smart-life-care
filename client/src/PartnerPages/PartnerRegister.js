import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/PartnerAuth.css";

const PartnerRegister = () => {
  const [formData, setFormData] = useState({
    hospitalName: "",
    hospitalPhone: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "hospitalPhone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else if (name === "password") {
      setFormData({ ...formData, [name]: value });

      if (!strongPasswordRegex.test(value)) {
        setPasswordError(
          "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character."
        );
      } else {
        setPasswordError("");
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s()]+$/;
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.hospitalName || !nameRegex.test(formData.hospitalName)) {
      newErrors.hospitalName = "Valid hospital name is required";
    }

    if (!formData.hospitalPhone || !phoneRegex.test(formData.hospitalPhone)) {
      newErrors.hospitalPhone = "Phone number must be exactly 10 digits";
    }

    if (!formData.email || !gmailRegex.test(formData.email)) {
      newErrors.email = "Valid Gmail is required (e.g., example@gmail.com)";
    }

    if (!formData.password || !strongPasswordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be 8+ characters, include 1 uppercase letter, 1 number & 1 special character.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/partners-register/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        console.error("Server response (not JSON):", text);
        alert("Unexpected server response. Check console for details.");
        return;
      }

      if (res.status === 201 && data.status === "success") {
        localStorage.setItem("partner", JSON.stringify(data.partner));
        localStorage.setItem("partnerToken", data.token);

        alert("Partner registered successfully!");
        navigate("/partner-dashboard", { replace: true });
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="partner-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Partner Registration</h2>

        {[
          { label: "Hospital Name", name: "hospitalName", type: "text" },
          { label: "Hospital Phone", name: "hospitalPhone", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Password", name: "password", type: "password" },
        ].map(({ label, name, type }) =>
          name === "password" ? (
            <div className="form-group password-group" key={name}>
              <label className="form-label" htmlFor={name}>
                {label}
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id={name}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {passwordError && (
                <small className="text-danger">{passwordError}</small>
              )}
              {errors[name] && (
                <span className="error">{errors[name]}</span>
              )}
            </div>
          ) : (
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
              {errors[name] && (
                <span className="error">{errors[name]}</span>
              )}
            </div>
          )
        )}

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

export default PartnerRegister;
