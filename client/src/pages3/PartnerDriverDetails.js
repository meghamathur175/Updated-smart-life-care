import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/PartnerDriverDetails.css";

const PartnerDriverDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const driver = location.state?.driver;

  if (!driver) {
    return (
      <div className="partner-driver-detail-view">
        <h2>No Driver Data Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="partner-driver-detail-view">
      <h1>Partner Driver Details</h1>
      <p>
        <strong>Hospital Name:</strong> {driver.hospitalName}
      </p>
      <p>
        <strong>Name:</strong> {driver.name}
      </p>
      <p>
        <strong>Phone:</strong> {driver.phone}
      </p>
      <p>
        <strong>Address:</strong> {driver.address}
      </p>
      <p>
        <strong>Vehicle Type:</strong> {driver.vehicleType}
      </p>

      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

export default PartnerDriverDetails;
