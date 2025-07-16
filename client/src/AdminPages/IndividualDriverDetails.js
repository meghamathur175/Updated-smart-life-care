import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/PartnerDriverDetails.css";

const IndividualDriverDetails = () => {
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
      <h1>Driver Details</h1>
      <p>
        <strong>Full Name:</strong> {driver.firstName} {driver.lastName}
      </p>
      <p>
        <strong>Email:</strong> {driver.email}
      </p>
      <p>
        <strong>Phone:</strong> {driver.phone}
      </p>
      <p>
        <strong>License Number:</strong> {driver.licenseNumber}
      </p>
      <p>
        <strong>Age:</strong> {driver.age}
      </p>
      <p>
        <strong>Vehicle Type:</strong> {driver.vehicleType}
      </p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

export default IndividualDriverDetails;
