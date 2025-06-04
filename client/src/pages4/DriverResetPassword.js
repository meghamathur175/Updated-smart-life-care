import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
// import "../styles/DriverReset.css";

function DriverResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleReset = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/drivers/reset-password/${token}`,
        { password }
      );
      alert(response.data.message || "Password reset successful");
      navigate("/driver-login");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Failed to reset password. Token may be expired."
      );
    }
  };

  return (
    <div className="driver-reset-container">
      <div className="driver-reset-box">
        <h2>Reset Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleReset}>Update Password</button>
      </div>
    </div>
  );
}

export default DriverResetPassword;
