import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/DriverLogin.css";

const DriverLoginForm = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^[0-9]{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      alert("Please enter a valid email or 10-digit phone number");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/drivers/login", {
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
        localStorage.setItem("driver", JSON.stringify(data.driver));
        localStorage.setItem("driverToken", data.token);
        alert("Driver Logged In");
        navigate("/driver-dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    // <div className="driver-login-container">
    <div className="driver-login-box">
      <h2 className="login-title">Log In as Driver</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="identifier">Phone Number or Email</label>
          <input
            type="text"
            id="identifier"
            className="form-control"
            placeholder="Enter your phone or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary">
          Log In
        </button>
      </form>

      <div className="extra-links">
        <Link to="/forgotPassword" className="forgot-link">
          Forgot Password?
        </Link>
        <p>
          Don't have an account?{" "}
          <Link to="/driver-register" className="register-link">
            Register
          </Link>
        </p>
      </div>
    </div>
    // </div>
  );
};

export default DriverLoginForm;
