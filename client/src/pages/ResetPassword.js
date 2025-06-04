import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { token } = useParams();

  // Strong password regex:
  // At least 8 characters, one uppercase, one lowercase, one digit, one special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handlePasswordChange = (e) => {
    const input = e.target.value;
    setPassword(input);

    if (!strongPasswordRegex.test(input)) {
      setPasswordError(
        "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character."
      );
    } else {
      setPasswordError("");
    }
  };

  let handleSignUp = (e) => {
    e.preventDefault();

    if (!strongPasswordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character."
      );
      return;
    }

    axios
      .post("http://localhost:3001/api/users/resetPassword/" + token, {
        password,
      })
      .then((result) => {
        if (result.data.status) {
          navigate("/signin");
          alert("password is reset successfully");
        }
        console.log(result.data);
      })
      .catch((err) => {
        console.log("Error:", err);
        alert("Something went wrong. Please try again.");
      });
  };
  return (
    <div className="container">
      <div className="wrapper d-flex align-items-center justify-content-center h-100">
        <div className="card register-form">
          <div className="card-body">
            <h5 className="card-title text-center">Reset Password</h5>
            <form onSubmit={handleSignUp}>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              {passwordError && (
                <div className="invalid-feedback">{passwordError}</div>
              )}
              {/* Submit button */}
              <button type="submit" className="btn btn-primary w-100">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
