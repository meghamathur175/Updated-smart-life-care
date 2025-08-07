import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/PartnerLogin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const HospitalLoginForm = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Axios instance with interceptor
  const axiosInstance = axios.create({
    baseURL: "http://localhost:3001/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response?.status === 401 &&
        error.response?.data?.message === "Token expired"
      ) {
        localStorage.removeItem("hospitalToken");
        localStorage.removeItem("hospital");
        localStorage.removeItem("hospitalId");
        localStorage.removeItem("hospitalName");
        window.location.href = "/hospital-login";
      }
      return Promise.reject(error);
    }
  );

  const handleIdentifierChange = (e) => {
    const value = e.target.value.trim();
    setIdentifier(value);
    setError(""); // clear on input
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const isEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(identifier);
    const isPhone = /^\d{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      setError("Enter a valid Gmail or 10-digit phone number");
      return;
    }

    const payload = { password };
    if (isEmail) payload.email = identifier;
    if (isPhone) payload.phone = identifier;

    try {
      const res = await axiosInstance.post("/hospitalregister/login", payload);
      const data = res.data;
      console.log("DATA login: ", data);

      if (data.token && data.partner) {
        localStorage.setItem("hospital", JSON.stringify(data.partner));
        localStorage.setItem("hospitalToken", data.token);
        localStorage.setItem("hospitalId", data.partner.id);
        localStorage.setItem("hospitalName", data.partner.hospitalName);

        alert("Hospital Logged In Successfully!");
        navigate("/partner-dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="partner-login-box">
      <h2 className="form-title">Log In as Hospital</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="identifier">Phone Number or Gmail</label>
          <input
            type="text"
            id="identifier"
            className="form-control"
            placeholder="Enter your phone or email"
            value={identifier}
            onChange={handleIdentifierChange}
            required
          />
        </div>

        <div className="form-group password-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="partner-login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-primary">
          Log In
        </button>
      </form>

      <div className="extra-links">
        <Link to="/hospital-forgot-password" className="forgot-link">
          Forgot Password?
        </Link>
        <p>
          Don't have an account?{" "}
          <Link to="/hospital-register" className="register-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default HospitalLoginForm;
