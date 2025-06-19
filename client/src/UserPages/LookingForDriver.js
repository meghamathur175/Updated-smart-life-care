import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import '../styles/LookingForDriver.css';

const LookingForDriver = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [driverAssigned, setDriverAssigned] = useState(false);

  const hospital = state?.hospital;
  const pickupLocation = state?.pickupLocation || "Unknown Location";
  const destinationLocation = state?.destAddress || "Unknown Destination";
  const ambulanceType = state?.ambulanceType || "Basic";

  const [driver, setDriver] = useState(state?.driver || {
    name: "Unavailable",
    plate: "Unavailable",
    otp: "0000",
    phone: "000-000-0000",
  });

  const ambulanceTypeCost = Number(state?.ambulanceTypeCost || 0);
  const distanceFare = state?.cost || 0;
  const price = ambulanceTypeCost + distanceFare;
  const bookingId = state?.bookingId;   
  console.log("Booking ID: ", bookingId);

  useEffect(() => {
  let mounted = true;

  if (!bookingId) return;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/partners/request-status/booking-id/${bookingId}`);
      const data = await res.json();
      console.log("DATA looking for: ", data);

      if (mounted && res.ok && data.status === "Assigned") {
        setDriver({
          name: data.driverName,
          plate: data.ambulancePlateNumber,
          otp: data.otp,
          phone: data.phone,
        });
        setDriverAssigned(true);
        clearInterval(interval);
      }
    } catch (err) {
      console.error("Error fetching driver status:", err);
    }
  }, 3000);

  return () => {
    mounted = false;
    clearInterval(interval);
  };
}, [bookingId]);


  useEffect(() => {
    if (driver?.name && driver.name !== "Unavailable") {
      setDriverAssigned(true);
    }
  }, [driver]);

  const handleDriverDetails = () => {
    const hospitalData = {
      place_id: hospital?.place_id,
      name: hospital?.name,
      vicinity: hospital?.vicinity,
      distance: hospital?.distance,
      duration: hospital?.duration,
      cost: hospital?.cost,
      rating: hospital?.rating,
      geometry: {
        location: {
          lat: hospital?.geometry?.location?.lat,
          lng: hospital?.geometry?.location?.lng,
        },
      },
    };

    const ride = {
      captain: {
        fullname: { firstname: driver.name },
        vehicle: { plate: driver.plate || "0000" },
      },
      otp: driver.otp,
      pickup: pickupLocation,
      destination: destinationLocation,
      fare: price,
      phone: driver.phone,
    };

    navigate('/waiting-for-driver', {
      state: { ride, hospital: hospitalData, ambulanceType },
    });
  };

  return (
    <div className="driver-popup">
      <h3 className="driver-title">
        {driverAssigned && driver.name !== "Unavailable" ? (
          <span className="assigned-message">
            Driver Assigned <FaCheckCircle className="assigned-icon" />
          </span>
        ) : (
          "Looking for a Driver"
        )}
      </h3>

      <div className="looking-driver-content">
        <div className="looking-driver-details">
          <div className="driver-detail-row">
            <i className="ri-user-fill"></i>
            <div>
              <h4 className="detail-heading">
                Driver: {driver.name}
              </h4>
              <h5>Phone: {driver.phone}</h5>
              <p className="detail-sub">
                Vehicle: {driver.plate} | OTP: {driver.otp}
              </p>
            </div>
          </div>

          <div className="driver-detail-row">
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h4 className="detail-heading">{pickupLocation}</h4>
              <p className="detail-sub">Pickup Point</p>
            </div>
          </div>

          <div className="driver-detail-row">
            <i className="ri-map-pin-2-fill"></i>
            <div>
              <h4 className="detail-heading">{destinationLocation}</h4>
              <p className="detail-sub">Destination</p>
            </div>
          </div>

          <div className="driver-detail-row">
            <i className="ri-currency-line"></i>
            <div>
              <h4 className="detail-sub">₹Ambulance Cost: {ambulanceTypeCost}</h4>
              <h4 className="detail-sub">₹Ride Cost: {distanceFare}</h4>
              <hr />
              <p className="detail-heading">Total Amount: ₹{price}</p>
            </div>
          </div>
        </div>

        {!driverAssigned || driver.name === "Unavailable" ? (
          <div className="pending-container">
            <div className="looking-for-driver-spinner" />
            <p className="pending-message">
              Hang tight! We’re assigning the best available ambulance near <b>{pickupLocation}</b>
            </p>
          </div>
        ) : (
          <>
            <button className="driver-detail-button fade-in" onClick={handleDriverDetails}>
              View Driver Details
            </button>
            <p className="pending-message">
              🎉 A driver has been assigned. You will receive a confirmation shortly.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LookingForDriver;
