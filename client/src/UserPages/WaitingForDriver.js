import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/WaitingForDriver.css';
import driverImg from '../images/I2.webp';

const WaitingForDriver = () => {
  const { state } = useLocation();
  const ride = state?.ride;
  // console.log("RIDE waitingPage: ", ride);
  const hospital = state?.hospital;
  const duration = hospital?.duration || "a few minutes";
  const ambulanceType = state?.ambulanceType || "Basic";

  const driverName = ride?.captain?.fullname?.firstname || "Driver Name";
  const ambulancePlateNumber = ride?.captain?.vehicle?.plate || "Plate Number";
  // console.log("ambulancePlateNumber waitingPage: ", ambulancePlateNumber);
  const otp = ride?.otp || "****";
  const pickup = ride?.pickup || "Pickup location";
  const destination = ride?.destination || "Drop location";
  const fare = ride?.fare ?? "0";

  return (
    <div className="waiting-container">
      <div className="driver-info">
        <img className="driver-img" src={driverImg} alt="Driver" />
        <div className="driver-details">
          <h2 className="driver-name">{driverName}</h2>
          <h4 className="vehicle-plate">{ambulancePlateNumber}</h4>
          <p className="vehicle-model">{ambulanceType}</p>
          <p className="driver-duration">{duration + " away"}</p>
          <h1 className="ride-otp">OTP: {otp}</h1>
        </div>
      </div>

      <div className="ride-info">
        <div className="ride-section">
          <i className="ri-map-pin-user-fill icon"></i>
          <div>
            <h3 className="ride-title">Pickup:</h3>
            <p className="ride-subtitle">{pickup}</p>
          </div>
        </div>

        <div className="ride-section">
          <i className="ri-map-pin-2-fill icon"></i>
          <div>
            <h3 className="ride-title">Destination:</h3>
            <p className="ride-subtitle">{destination}</p>
          </div>
        </div>

        <div className="ride-section">
          <i className="ri-currency-line icon"></i>
          <div>
            <h3 className="ride-title">Amount: ₹{fare}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;
