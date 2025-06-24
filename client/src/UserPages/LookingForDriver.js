import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaAmbulance } from 'react-icons/fa';
import '../styles/LookingForDriver.css';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

const LookingForDriver = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [driverAssigned, setDriverAssigned] = useState(false);
  const [data, setData] = useState("");
  const [statusMessage, setStatusMessage] = useState("Request sent. Waiting for response...");
  const [requestTimedOut, setRequestTimedOut] = useState(false);

  const hospital = state?.hospital;
  const [hospitalName, setHospitalName] = useState(hospital?.name || "Unknown Hospital");

  const pickupLocation = state?.pickupLocation || "Unknown Location";
  const destinationLocation = state?.destAddress || "Unknown Destination";
  const ambulanceType = state?.ambulanceType || "Basic";
  const ambulanceTypeCost = Number(state?.ambulanceTypeCost || 0);
  const distanceFare = state?.cost || 0;
  const price = ambulanceTypeCost + distanceFare;
  const bookingId = state?.bookingId;

  const [driver, setDriver] = useState(state?.driver || {
    name: "Unavailable",
    plate: "Unavailable",
    otp: "0000",
    phone: "000-000-0000",
  });

  useEffect(() => {
    let mounted = true;

    if (!bookingId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/partners/request-status/booking-id/${bookingId}`);
        const data = await res.json();

        if (!res.ok || !mounted) return;

        console.log("Data LFA req-status: ", data);

        if (mounted) {
          setData(data);

          if (data.hospitalName && data.hospitalName !== hospitalName) {
            setHospitalName(data.hospitalName);
          }

          if (data.status.toLowerCase() === "accepted") {
            setStatusMessage(`✅ Request accepted by ${hospitalName}. Assigning a driver...`);
          }
          else if (data.status.toLowerCase() === "rejected & reassigned") {
            setStatusMessage(`❌ Request rejected by ${hospital.name}.Request transferred to ${hospitalName}. Awaiting response...`);
          }
          else if (data.status.toLowerCase() === "reassigned") {
            setDriverAssigned(false);
            setDriver({
              name: "Unavailable",
              plate: "Unavailable",
              otp: "0000",
              phone: "000-000-0000",
            });
            setStatusMessage(`Request is rejected by ${hospital.name}. Request transferred to ${hospitalName}. Awaiting response...`);
          }
          else if (data.status.toLowerCase() === "assigned") {
            setDriver({
              name: data.driverName,
              plate: data.ambulancePlateNumber,
              otp: data.otp,
              phone: data.phone,
            });

            if (data.hospitalName && data.hospitalName !== hospitalName) {
              setHospitalName(data.hospitalName);
            }

            setDriverAssigned(true);
            // setStatusMessage(`✅ Driver assigned by ${hospitalName}`);
            setStatusMessage(`✅ Driver assigned by ${data.hospitalName || hospitalName}`);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Error fetching driver status:", err);
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [bookingId, hospitalName]);


  const urgency = state?.urgency || "";
  const urgencyDuration = urgency === "Emergency - Life-threatening, immediate action required" ? 30 : urgency === "Priority - Needs quicker assistance" ? 60 : 120;
  const [timerCompleted, setTimerCompleted] = useState(false);

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
      otp: data.otp,
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
      <div className="looking-driver-content">
        <div className="looking-driver-details">
          <div className="look-driver-detail-row">
            <i className="ambulance-icon">
              <FaAmbulance />
            </i>
            <div>
              <h4 className="detail-heading">{ambulanceType}</h4>
              <p className="looking-for-driver-detail-sub">Ambulance Requested</p>
            </div>
          </div>

          <div className="look-driver-detail-row">
            <i className="urgency-icon">
              <FaExclamationCircle />
            </i>
            <div>
              <h4 className="detail-heading">{state.urgency}</h4>
              <p className="looking-for-driver-detail-sub">Urgency</p>
            </div>
          </div>

          <div className="look-driver-detail-row">
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h4 className="detail-heading">{pickupLocation}</h4>
              <p className="looking-for-driver-detail-sub">Pickup Point</p>
            </div>
          </div>

          <div className="look-driver-detail-row">
            <i className="ri-map-pin-2-fill"></i>
            <div>
              <h4 className="detail-heading">{destinationLocation}</h4>
              <p className="looking-for-driver-detail-sub">Destination</p>
            </div>
          </div>

          <div className="look-driver-detail-row">
            <i className="ri-currency-line"></i>
            <div>
              <h4 className="looking-for-driver-detail-sub">₹Ambulance Cost: {ambulanceTypeCost}</h4>
              <h4 className="looking-for-driver-detail-sub">₹Ride Cost: {distanceFare}</h4>
              <hr />
              <p className="detail-heading">Total Amount: ₹{price}</p>
            </div>
          </div>
        </div>

        {!driverAssigned || driver.name === "Unavailable" ? (
          <div className="pending-container">
            <p className="status-update-message">{statusMessage}</p>

            {!timerCompleted && (
              <div className="timer-section">
                <CountdownCircleTimer
                  isPlaying={!driverAssigned}
                  duration={urgencyDuration}
                  colors={["#00ff00", "#ff7d29", "#ff0000", "#ff0000"]}
                  colorsTime={[
                    urgencyDuration,
                    urgencyDuration / 2,
                    urgencyDuration / 4,
                    0
                  ]}
                  strokeWidth={10}
                  size={90}
                  onComplete={() => {
                    setTimerCompleted(true);
                    if (data?.status !== "Assigned") {
                      setRequestTimedOut(true);
                    }
                    return [false, 0];
                  }}
                >
                  {({ remainingTime }) => (
                    <div className="timer-text">{remainingTime}s</div>
                  )}
                </CountdownCircleTimer>
              </div>
            )}

            {!timerCompleted && (
              <p className="pending-message">
                Hang tight! We’re assigning the best available ambulance near <b>{pickupLocation}</b>
              </p>
            )}

            {requestTimedOut && (
              <p className="timeout-message">
                ❌ Oops! Couldn’t find a driver in time. Please try another hospital.
              </p>
            )}

          </div>
        ) : (
          <>
            <h3 className="driver-title">
              <span className="assigned-message">
                Driver assigned by {hospitalName} <FaCheckCircle className="assigned-icon" />
              </span>
            </h3>
            <button className="driver-detail-button fade-in" onClick={handleDriverDetails}>
              View Driver Details
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default LookingForDriver;
