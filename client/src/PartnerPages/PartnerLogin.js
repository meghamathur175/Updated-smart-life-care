import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/PartnerLogin.css";

const PartnerLoginForm = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Restrict input for phone to digits only and max 10 digits on change
  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    // If input looks like a phone (only digits), limit length to 10 digits
    if (/^\d*$/.test(value)) {
      if (value.length <= 10) {
        setIdentifier(value);
      }
    } else {
      // Otherwise allow any input (for email)
      setIdentifier(value);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^[0-9]{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      alert("Please enter a valid email or 10-digit phone number");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:3001/api/partners-register/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: isEmail ? identifier : undefined,
            phone: isPhone ? identifier : undefined,
            password,
          }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("partner", JSON.stringify(data.partner));
        localStorage.setItem("partnerToken", data.token);
        alert("Partner Logged In");
        navigate("/partner-dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="partner-login-box">
      <h2 className="form-title">Log In as Partner</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="identifier">Phone Number or Email</label>
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
          <label htmlFor="password" className="form-label">
            Password
          </label>
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
            {showPassword ? (
              <i className="fa fa-eye-slash" aria-hidden="true"></i>
            ) : (
              <i className="fa fa-eye" aria-hidden="true"></i>
            )}
          </span>
        </div>


        <button type="submit" className="btn-primary">
          Log In
        </button>
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
