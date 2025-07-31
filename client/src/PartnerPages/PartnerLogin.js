import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/PartnerLogin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PartnerLoginForm = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Restrict phone to 10 digits only, allow Gmail only for email
  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      // if only digits, treat it as phone
      if (value.length <= 10) {
        setIdentifier(value);
        setError("");
      }
    } else {
      setIdentifier(value);
      setError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const isEmail = gmailRegex.test(identifier);
    const isPhone = /^\d{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      setError("Enter a valid Gmail (e.g., name@gmail.com) or 10-digit phone number");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/partners-register/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: isEmail ? identifier : undefined,
          phone: isPhone ? identifier : undefined,
          password,
        }),
      });

      const data = await res.json();
      
      if (data.status === "success") {
        localStorage.setItem("partner", JSON.stringify(data.partner));
        localStorage.setItem("partnerToken", data.token);
        localStorage.setItem("partnerId", data.partner._id);
        localStorage.setItem("partnerName", data.partner.name);
        alert("Partner Logged In");
        navigate("/partner-dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="partner-login-box">
      <h2 className="form-title">Log In as Partner</h2>
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
          <label htmlFor="password" className="form-label">Password</label>
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

        <button type="submit" className="btn-primary">Log In</button>
      </form>

      <div className="extra-links">
        <Link to="/partner-forgot-password" className="forgot-link">
          Forgot Password?
        </Link>
        <p>
          Don't have an account?{" "}
          <Link to="/partner-register" className="register-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PartnerLoginForm;
