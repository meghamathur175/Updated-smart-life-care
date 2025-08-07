import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HospitalRegister.css";
import axios from "axios";

const HospitalRegister = () => {
  const [formData, setFormData] = useState({
    hospitalName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.hospitalName.trim())
      newErrors.hospitalName = "Hospital name is required";

    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be exactly 10 digits";

    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";

    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage("");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/hospitalregister/register",
        formData
      );

      setSuccessMessage(response.data.message);
      setErrors({});
      setFormData({
        hospitalName: "",
        phone: "",
        email: "",
        password: "",
      });

      alert("Registration successful! Please wait for admin approval.");
      navigate("/hospital-login");
    } catch (err) {
      const apiError =
        err.response?.data?.message || "Registration failed. Try again.";
      setErrors({ api: apiError });
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "2rem" }}>
      <h2>Hospital Partner Registration</h2>

      <form onSubmit={handleSubmit}>
        {["hospitalName", "phone", "email", "password"].map((field) => (
          <div key={field} style={{ marginBottom: "1rem" }}>
            <label>
              {field === "hospitalName"
                ? "Hospital Name"
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.3rem",
              }}
            />
            {errors[field] && (
              <p style={{ color: "red", marginTop: "0.3rem" }}>
                {errors[field]}
              </p>
            )}
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {errors.api && (
          <p style={{ color: "red", marginTop: "1rem" }}>{errors.api}</p>
        )}

        {successMessage && (
          <p style={{ color: "green", marginTop: "1rem" }}>{successMessage}</p>
        )}
      </form>
    </div>
  );
};

export default HospitalRegister;
