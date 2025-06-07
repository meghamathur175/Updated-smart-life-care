  import React from 'react';
  import { useLocation } from 'react-router-dom';
  import '../styles/WaitingForDriver.css';
  import driverImg from '../images/I2.webp';

  const WaitingForDriver = () => {
    const { state } = useLocation();
    const hospital = state?.hospital;
    const duration = hospital?.duration;
    const ambulanceType = state?.ambulanceType;
    const ride = state?.ride;

    return (
      <div className="waiting-container">
        <div className="driver-info">
          <img
            className="driver-img"
            src={driverImg}
            alt="Driver"
          />
          <div className="driver-details">
            <h2 className="driver-name">{ride?.captain?.fullname?.firstname || "Driver Name"}</h2>
            <h4 className="vehicle-plate">{ride?.captain?.vehicle?.plate || "Plate Number"}</h4>
            <p className="vehicle-model">{ambulanceType + " Ambulance"}</p>
            <p className="driver-duration">{duration + " away"}</p>
            <h1 className="ride-otp">OTP: {ride?.otp || "OTP"}</h1>
          </div>
        </div>

        <div className="ride-info">
          <div className="ride-section">
            <i className="ri-map-pin-user-fill icon"></i>
            <div>
              <h3 className="ride-title">Pickup: </h3>
              <p className="ride-subtitle">{ride?.pickup}</p>
            </div>
          </div>

          <div className="ride-section">
            <i className="ri-map-pin-2-fill icon"></i>
            <div>
              <h3 className="ride-title">Destination:</h3>
              <p className="ride-subtitle">{ride?.destination}</p>
            </div>
          </div>

          <div className="ride-section">
            <i className="ri-currency-line icon"></i>
            <div>
              <h3 className="ride-title">₹{ride?.fare || "0"}</h3>
              <p className="ride-subtitle">Cash</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default WaitingForDriver;
