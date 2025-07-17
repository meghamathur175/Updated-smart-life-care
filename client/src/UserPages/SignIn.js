import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DriverLoginForm from "../DriverPages/DriverLogin";
import { useLogin } from "../LoginContext";
import "../styles/LogIn.css";

const SignIn = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { setIsLoggedIn } = useLogin();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (selectedRole === "Partner") {
      navigate("/partner-login");
    } else if (selectedRole === "Driver") {
      navigate("/driver-login");
    }
  }, [selectedRole, navigate]);

  const handleRoleSelect = (e) => {
    setSelectedRole(e.target.value);
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/users/login",
        {
          ...formData,
          role: selectedRole,
        }
      );

      // console.log("RESPONSE from user login : ", response);

      const { user, token, status, message } = response.data;

      if (status === "success") {
        localStorage.setItem("userToken", token);
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", user.name || "");
        localStorage.setItem("userId", user._id || "");
        setIsLoggedIn(true);

        alert(`Login Successful as ${selectedRole}!`);
        navigate("/");
      } else {
        alert(message || "Invalid credentials. Try again.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(
        "Unable to login. Please check your credentials or try again later."
      );
    }
  };

  return (
    <div className="container">
      <div className="wrapper">
        {step === 1 ? (
          <div className="role-selection">
            <h3>Select User Type</h3>
            <select
              value={selectedRole}
              onChange={handleRoleSelect}
              className="form-control"
            >
              <option value="">-- Select User Type --</option>
              <option value="User">User</option>
              <option value="Partner">Hospital Partner</option>
              <option value="Driver">Life Saver</option>
            </select>
          </div>
        ) : selectedRole === "Driver" ? (
          <div className="login-form">
            <DriverLoginForm />
          </div>
        ) : (
          <div className="login-form">
            <h5 className="card-title">Login as {selectedRole}</h5>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {formData.email && !emailRegex.test(formData.email) && (
                  <small className="text-danger">
                    Please enter a valid email address.
                  </small>
                )}
              </div>

              <div className="form-group password-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
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
              </div>

              <button type="submit" className="btn-primary">
                Log In
              </button>
            </form>

            <div className="forgot-password">
              <Link to="/forgotPassword">Forgot Password?</Link>
            </div>

            <div className="sign-up">
              Don't have an account?{" "}
              <Link
                to="/signup"
                state={{ selectedRole: selectedRole || "User" }}
              >
                Register
              </Link>
            </div>

            <div className="back-to-role">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                Back to Role Selection
              </button>
            </div>
          </div>
        )}

        {selectedRole !== "Driver" && (
          <div className="signin-home-icon-below">
            <a href="/" className="signin-home-icon">
              <i className="fa fa-home"></i>
              <span className="signin-tooltip-text">Home</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;
