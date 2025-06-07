import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../LoginContext";
import "../styles/LogIn.css"; 

const PartnerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn } = useLogin();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "Partner" }),
      });

      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);

        alert("Login Successful as Partner!");
        navigate("/partner-dashboard");
      } else {
        alert(data.message || "Invalid credentials. Try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Unable to login. Please check your backend.");
    }
  };

  return (
    <div className="container">
      <div className="wrapper login-form">
        <h5 className="card-title">Partner Login</h5>
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
        </form>

        <div className="forgot-password">
          <Link to="/forgotPassword">Forgot Password?</Link>
        </div>

        <div className="sign-up">
          Don't have an account?{" "}
          <Link to="/signup" state={{ selectedRole: "Partner" }}>
            Register
          </Link>
        </div>

        <div className="back-to-role">
          <Link to="/signin" className="btn-secondary">Back to Role Selection</Link>
        </div>

        <div className="signin-home-icon-below">
          <a href="/" className="signin-home-icon">
            <i className="fa fa-home"></i>
            <span className="signin-tooltip-text">Home</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;
