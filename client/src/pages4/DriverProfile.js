import React from "react";
import "../styles/DriverProfile.css";

const DriverProfile = () => {
  return (
    <div className="driver-profile">
      <h1>Your Profile</h1>
      <div className="profile-info">
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> johndoe@example.com</p>
        <p><strong>Phone:</strong> +1 234 567 890</p>
      </div>
    </div>
  );
};

export default DriverProfile;