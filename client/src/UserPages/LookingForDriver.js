import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaAmbulance } from 'react-icons/fa';
import '../styles/LookingForDriver.css';
import 'remixicon/fonts/remixicon.css';
import { enrichHospitals } from "../utils/enrichHospitals";
import { useJsApiLoader } from '@react-google-maps/api';
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const LookingForDriver = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const hospital = state?.hospital;
  const pickupLocation = state?.pickupLocation || 'Unknown Location';
  const destinationLocation = state?.destAddress || 'Unknown Destination';
  const ambulanceType = state?.ambulanceType || 'Basic';
  const ambulanceTypeCost = Number(state?.ambulanceTypeCost || 0);
  const distanceFare = Number(state?.cost || 0);
  const totalFare = ambulanceTypeCost + distanceFare;
  const bookingId = state?.bookingId;
  const urgency = state?.urgency || '';

  const [driver, setDriver] = useState({
    name: 'Unavailable',
    plate: 'Unavailable',
    otp: '0000',
    phone: '000-000-0000'
  });

  const [statusList, setStatusList] = useState([]);
  const [hospitalName, setHospitalName] = useState(hospital?.name || 'Unknown Hospital');
  const [driverAssigned, setDriverAssigned] = useState(false);
  const [data, setData] = useState({});
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [isReassigning, setIsReassigning] = useState(false);
  const [isHospitalSelectionRequired, setIsHospitalSelectionRequired] = useState(false);
  const [timerStart, setTimerStart] = useState(null);
  const [urgencyDuration, setUrgencyDuration] = useState(60); // default  

  // Load initial status list from localStorage or initialize it
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`statusList_${bookingId}`));
    if (stored && Array.isArray(stored)) {
      setStatusList(stored);
    } else if (hospital?.name) {
      const initialStatus = [`Request sent to ${hospital.name}`];
      setStatusList(initialStatus);
      localStorage.setItem(`statusList_${bookingId}`, JSON.stringify(initialStatus));
    }
  }, [bookingId, hospital]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Polling status updates every second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/partners/request-status/booking-id/${bookingId}`);
        const data = await res.json();
        setData(data);
        // console.log("DATA from req-status: ", data); 

        // Set timer start and urgencyDuration only once
        if (data.timestamp && !timerStart) {
          const start = new Date(data.timestamp).getTime();
          setTimerStart(start);

          let duration = 120; // default
          if (urgency.includes("Life-threatening")) duration = 30;
          else if (urgency.includes("Priority")) duration = 60;

          setUrgencyDuration(duration);
        }

        const newHospitalName = data.hospitalName || hospitalName;
        const status = data.status?.toLowerCase();

        if (status === 'accepted' && !driverAssigned) {
          const acceptedMsg = `✅ Request Accepted by ${newHospitalName}. Assigning driver...`;

          setStatusList((prev) => {
            if (!prev.includes(acceptedMsg)) {
              const updated = [...prev, acceptedMsg];
              localStorage.setItem(`statusList_${bookingId}`, JSON.stringify(updated));
              return updated;
            }
            return prev;
          });

          setHospitalName(newHospitalName);
        }

        else if (
          status === 'assigned' ||
          status === 'assigned_by_individual_driver' ||
          (data.driverType === 'IndependentDriver' && status === 'searching')
        ) {
          const isIndependentDriver =
            status === 'assigned_by_individual_driver' || data.driverType === 'IndependentDriver';

          setDriver({
            name: data.driverName,
            plate: data.ambulancePlateNumber,
            otp: data.otp,
            phone: data.phone,
          });

          const assignedMsg = isIndependentDriver
            ? `✅ Individual driver assigned`
            : `✅ Driver assigned by ${newHospitalName}`;

          setStatusList((prev) => {
            if (!prev.includes(assignedMsg)) {
              const updated = [...prev, assignedMsg];
              localStorage.setItem(`statusList_${bookingId}`, JSON.stringify(updated));
              return updated;
            }
            return prev;
          });

          setDriverAssigned(true);
          clearInterval(interval);
        }

        else if (
          status === "rejected" &&
          Array.isArray(data?.nearbyHospitals) &&
          data.nearbyHospitals.length > 0 &&
          data.pickupCoordinates
        ) {

          // Reset timerStart to now for fresh countdown
          setTimerStart(Date.now());

          if (data.nearbyHospitals?.length && data?.pickupCoordinates) {
            const enriched = await enrichHospitals(data.nearbyHospitals, {
              lat: data.pickupCoordinates[1],
              lng: data.pickupCoordinates[0],
            });

            // console.log("✅ Enriched Hospitals:", enriched);

            if (enriched?.length) {
              setNearbyHospitals(enriched);
            }
          }

          // console.log("data.nearbyHospitals: ", data.nearbyHospitals);

          setIsHospitalSelectionRequired(true);

          setStatusList((prev) => {
            const rejectedBy = data.hospitalName || hospitalName || "Unknown Hospital";
            const lastMsg = prev[prev.length - 1];
            const pendingMsg = `❗ Request rejected by ${rejectedBy}. Please select another hospital.`;

            // ✅ Only add if it's NOT the exact last message
            if (lastMsg !== pendingMsg) {
              const updated = [...prev, pendingMsg];
              localStorage.setItem(`statusList_${bookingId}`, JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Status fetch error:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingId, hospitalName]);

  const handleHospitalSelection = async (selectedHospitalId) => {
    setIsReassigning(true);
    try {
      const res = await fetch("http://localhost:3001/api/partners/confirm-hospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPartnerId: selectedHospitalId,
          originalPartnerId: state.hospital?._id,
          bookingId,
          previousReassignedPartners: data?.reassignedPartners || [],
          pickup: pickupLocation,
          drop: destinationLocation,
          ambulanceType,
          urgency,
          userName: localStorage.getItem("userName") || "Unknown",
        }),
      });

      const result = await res.json();
      // console.log("RESULTS from confirm-hospital: ", result);

      if (res.ok) {
        setStatusList((prev) => {
          const prevHospitalName = result.prevHospitalName || "Unknown Hospital";
          const reassignedTo = result.reassignedRequest?.hospitalName || result.reassignedRequest?.hospital || "selected hospital";

          const updated = [
            ...prev,
            `✅ Request is resended to ${reassignedTo}`,
          ];

          localStorage.setItem(`statusList_${bookingId}`, JSON.stringify(updated));
          return updated;
        });

        setNearbyHospitals([]);
        setIsHospitalSelectionRequired(false);
      } else {
        alert(result.message || "Failed to reassign");
      }
    } catch (err) {
      console.error("Error selecting hospital:", err);
      alert("Error selecting hospital");
    } finally {
      setIsReassigning(false);
    }
  };

  // View Driver Details Button
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
        vehicle: { plate: driver.plate }
      },
      otp: data?.otp,
      pickup: pickupLocation,
      destination: destinationLocation,
      fare: totalFare,
      phone: driver.phone,
      driverType: data.driverType,
      status: data.status
    };

    navigate('/waiting-for-driver', {
      state: { ride, hospital: hospitalData, ambulanceType },
    });

    // Optional: clear status timeline here if needed
    // localStorage.removeItem(`statusList_${bookingId}`);
  };

  return (
    <div className="driver-popup">
      <div className="looking-driver-content">
        {/* Ride Details Section */}
        <div className="looking-driver-details">
          <div className="look-driver-detail-row">
            <i className="ambulance-icon"><FaAmbulance /></i>
            <div>
              <h4 className="detail-heading">{ambulanceType}</h4>
              <p className="looking-for-driver-detail-sub">Ambulance Requested</p>
            </div>
          </div>
          <div className="look-driver-detail-row">
            <i className="urgency-icon"><FaExclamationCircle /></i>
            <div>
              <h4 className="detail-heading">{urgency}</h4>
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
              <p className="detail-heading">Total Amount: ₹{totalFare}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline Section */}
        <div className="pending-container">
          <h3 className="timeline-heading">Status Timeline</h3>
          <div className="status-line">
            {statusList.map((msg, index) => (
              <div className="status-step fade-in" key={index}>
                <span
                  className={`dot ${index <= statusList.length - 1 ? 'filled' : ''} ${index === statusList.length - 1 ? 'pulse' : ''}`}
                />
                <p>{msg}</p>
              </div>
            ))}
          </div>
        </div>

        {timerStart && !driverAssigned && isHospitalSelectionRequired && (
          <div className="user-timer-container">
            <h4>⏱ Auto assigning hospital in </h4>
            <CountdownCircleTimer
              isPlaying
              duration={urgencyDuration}
              initialRemainingTime={Math.max(urgencyDuration - Math.floor((Date.now() - timerStart) / 1000), 0)}
              colors={["#00ff00", "#ff7d29", "#ff0000", "#ff0000"]}
              colorsTime={[urgencyDuration, urgencyDuration / 2, urgencyDuration / 4, 0]}
              strokeWidth={8}
              size={80}
              onComplete={() => {
                console.log("⚠️ No driver was assigned within time.");
                if (!driverAssigned && nearbyHospitals.length > 0) {
                  handleHospitalSelection(nearbyHospitals[0]._id);
                }
                return [false, 0]; // don't restart
              }}
            >
              {({ remainingTime }) => <div style={{ fontSize: "18px" }}>{remainingTime}s</div>}
            </CountdownCircleTimer>
          </div>
        )}

        <div className="hospital-selection-card-list">
          {nearbyHospitals.map(hospital => (
            <div key={hospital._id} className="hospital-selection-hospital-card">
              <p><strong>{hospital.name}</strong></p>
              <p>📍 {hospital.address}</p>
              <p>📏 Distance: {hospital.distance} km away</p>
              <p>⏱ ETA: {hospital.duration} </p>
              <p>💰 Cost: {hospital.cost}</p>
              <button
                disabled={isReassigning}
                onClick={() => handleHospitalSelection(hospital._id)}
              >
                {isReassigning ? "Assigning..." : "Select This Hospital"}
              </button>
            </div>
          ))}
        </div>


        {/* Driver Assigned UI */}
        {driverAssigned && (
          <>
            <p className="driver-type-tag">
              {(data.driverType ?? data.status?.toLowerCase()) === 'assigned_by_individual_driver' || data.driverType === 'IndependentDriver'
                ? 'Individual Driver'
                : 'Partner Driver'}
            </p>
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
