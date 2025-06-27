import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";
import axios from "axios";

const DriverForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (e) => {
    const input = e.target.value;
    setEmail(input);

    if (!emailRegex.test(input)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    axios
      .post("http://localhost:3001/api/drivers/forgot-password", { email })
      .then((result) => {
        if (result.data.status) {
          alert("Check your email for the reset password link");
          navigate("/driver-login");
        } else {
          alert("Something went wrong. Please try again.");
        }
      })
      .catch((err) => {
        console.error("Driver forgot password error:", err);
        alert("Something went wrong. Please try again.");
      });
  };

  return (
    <div className="container" style={{ height: "90%" }}>
      <div className="wrapper d-flex align-items-center justify-content-center h-100">
        <div className="card register-form">
          <div className="card-body">
            <h5 className="card-title text-center">Driver Forgot Password</h5>

            <form onSubmit={handleSubmit}>
              {/* Email input */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Driver Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                />
              </div>
              {emailError && (
                <div className="invalid-feedback d-block">{emailError}</div>
              )}

              {/* Submit button */}
              <button type="submit" className="btn btn-primary w-100">
                Send Reset Link
              </button>
            </form>
          </div>
        </div>

        <div className="forgot-password-home-icon">
          <a href="/" className="home-icon">
            <i className="fa fa-home"></i>
            <span className="tooltip-text">Home</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DriverForgotPassword;
