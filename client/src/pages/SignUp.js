import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import "../styles/Register.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const location = useLocation();
  const selectedRole = location.state?.selectedRole || "User"; // default to User


  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (passwordError || !strongPasswordRegex.test(password)) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Registration Successful!");
        setTimeout(() => navigate("/signin"), 1000);
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error registering:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Register as {selectedRole}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            {email && !emailRegex.test(email) && (
              <small className="text-danger">Please enter a valid email address.</small>
            )}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!strongPasswordRegex.test(e.target.value)) {
                    setPasswordError(
                      "Password must be at least 8 characters, contain one uppercase letter, one number and one special character."
                    );
                  } else {
                    setPasswordError("");
                  }
                }}

                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {password && passwordError && (
              <small className="text-danger">{passwordError}</small>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            Register
          </button>

          <div className="sign-up">
            Already have an account? <Link to="/signin">LogIn</Link>
          </div>
        </form>
      </div>

      <div className="signup-home-icon">
        <a href="/" className="home-icon">
          <i className="fa fa-home"></i>
          <span className="tooltip-text">Home</span>
        </a>
      </div>
    </div>
  );
};

export default SignUp;
