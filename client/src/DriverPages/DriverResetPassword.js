import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/DriverReset.css";
import axios from "axios";

function DriverResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      console.log("Sending resetPass req...")
      const response = await axios.post(
        `http://localhost:3001/api/drivers/driver-reset-password/${token}`,
        { password }
      );

      console.log("response from reset-password route: ", response);

      alert(response.data.message || "Password reset successful");
      navigate("/driver-login");
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
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              id="password"
              placeholder="Enter your new password"
              value={password}
              onChange={handlePasswordChange}
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
          {passwordError && (
            <div className="invalid-feedback">{passwordError}</div>
          )}

          <button type="submit" disabled={loading || password.length < 6}>
            {loading ? "Updating..." : "Update Password"}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default DriverResetPassword;
