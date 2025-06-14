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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:3001/api/drivers/reset-password/${token}`,
        { password }
      );

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
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" disabled={loading || password.length < 6}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DriverResetPassword;
