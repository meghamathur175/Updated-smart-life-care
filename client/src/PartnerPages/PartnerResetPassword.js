import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/PartnerReset.css";
import axios from "axios";

function PartnerResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!strongPasswordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character."
      );
    } else {
      setPasswordError("");
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:3001/api/partners-register/reset-password/${token}`,
        { password }
      );

      alert(response.data.message || "Password reset successful");
      navigate("/partner-login");
    } catch (error) {
      setError(
        error?.response?.data?.message ||
        "Failed to reset password. Token may be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-reset-container">
      <div className="driver-reset-box">
        <h2>Partner Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <div className="password-wrapper">
            <label htmlFor="password" className="form-label">
            </label>
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
              className="partner-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
            >
              {showPassword ? (
                <i className="fa fa-eye-slash" aria-hidden="true"></i>
              ) : (
                <i className="fa fa-eye" aria-hidden="true"></i>
              )}
            </span>
            {passwordError && (
              <small className="text-danger">{passwordError}</small>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>

          <button type="submit">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PartnerResetPassword;
