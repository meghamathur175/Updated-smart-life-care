import React from "react";
import { useLocation } from "react-router-dom";
import '../styles/BookAmbulance.css';

function BookAmbulance() {
  const { state } = useLocation();

  const hospital = state?.hospital;
  const pickupLocation = state?.pickupLocation;
  const destination = state?.destAddress;  

  return (
    <div className="bookAmbulance-container">
      <h1>Book Ambulance</h1>
      <p><strong>Pickup Location:</strong> {pickupLocation}</p>
      {hospital ? (
          <div>
          <h2>Selected Hospital</h2>
            <p><strong>Hospital Name:</strong> {destination}</p>
          <p><strong>Address:</strong> {hospital.vicinity}</p>
          <p><strong>Distance:</strong> {hospital.distance}</p>
          <p><strong>Duration:</strong> {hospital.duration}</p>
          <p><strong>Estimated Cost:</strong> {hospital.cost}</p>
        </div>
      ) : (
        <p>No hospital selected.</p>
      )}
    </div>
  );
}

export default BookAmbulance;
