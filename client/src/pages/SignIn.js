import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LogIn.css";
import { useLogin } from "../LoginContext"; 

const SignIn = () => {
  const [step, setStep] = useState(1); // Step 1: Select Role, Step 2: Login
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSubRoleModal, setShowSubRoleModal] = useState(false);
  const navigate = useNavigate();

  const { setIsLoggedIn } = useLogin(); 

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRoleSelect = (e) => {
    setSelectedRole(e.target.value);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("isLoggedIn", "true"); 
        setIsLoggedIn(true); 

        alert(`Login Successful as ${selectedRole}!`);

        if (selectedRole === "Partner") {
          setShowSubRoleModal(true);
        } else if (selectedRole === "Admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      } else {
        alert(data.message || "Invalid credentials. Try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Unable to login. Please check your backend.");
    }
  };

  const handleSubRoleSelect = (subRole) => {
    setShowSubRoleModal(false);
    if (subRole === "Partner") {
      navigate("/partner-dashboard");
    } else if (subRole === "Driver") {
      navigate("/driver-dashboard");
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
              <option value="Admin">Admin</option>
              <option value="Partner">Partner</option>
            </select>
          </div>
        ) : (
          <div className="login-form">
            <h5 className="card-title">Login as {selectedRole}</h5>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {email && !emailRegex.test(email) && (
                  <small className="text-danger">Please enter a valid email address.</small>
                )}
              </div>

              <div className="form-group password-group">
                <label htmlFor="password" className="form-label">Password</label>
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
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  role="button"
                >
                  {showPassword ? (
                    <i className="fa fa-eye-slash" aria-hidden="true"></i>
                  ) : (
                    <i className="fa fa-eye" aria-hidden="true"></i>
                  )}
                </span>
              </div>

              <button type="submit" className="btn-primary">LogIn</button>

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
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  Back to Role Selection
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="signin-home-icon-below">
          <a href="/" className="signin-home-icon">
            <i className="fa fa-home"></i>
            <span className="signin-tooltip-text">Home</span>
          </a>
        </div>
      </div>

      {showSubRoleModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Select Your Role</h4>
            <button onClick={() => handleSubRoleSelect("Partner")} className="btn-primary">Partner</button>
            <button onClick={() => handleSubRoleSelect("Driver")} className="btn-primary">Driver</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
