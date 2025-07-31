

import React, { useEffect, useState, useRef } from 'react';
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
  const [nearbyHospitals, setNearbyHospitals] = useState(state?.nearbyHospitals || []);
  const [assignedDrivers, setAssignedDrivers] = useState([]);

  const [statusList, setStatusList] = useState([]);
  const [hospitalName, setHospitalName] = useState(hospital?.name || 'Unknown Hospital');
  const [driverAssigned, setDriverAssigned] = useState(false);
  const [data, setData] = useState({});
  const [isReassigning, setIsReassigning] = useState(false);
  const [isHospitalSelectionRequired, setIsHospitalSelectionRequired] = useState(false);
  const [timerStart, setTimerStart] = useState(null);
  const [urgencyDuration, setUrgencyDuration] = useState(60); // default  
  const [driverAssignedCount, setDriverAssignedCount] = useState(0);
  const [driverTotalNeeded, setDriverTotalNeeded] = useState(1);

  const intervalRef = useRef();

  const appendStatusMessage = (message) => {
    setStatusList((prev) => {
      if (!prev.includes(message)) {
        const updated = [...prev, message];
        localStorage.setItem(`statusList_${bookingId}`, JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

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
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/partners/request-status/booking-id/${bookingId}`);
        const data = await res.json();
        setData(data);

        console.log("DATA in LFD page after getReqByBookingId api call: ", data);

        // Set timer start and urgencyDuration only once
        // Start timer for auto-reassignment only if not already set
        if (!timerStart) {
          const start = Date.now();
          setTimerStart(start);

          let duration = 120;
          if (urgency.includes("Life-threatening")) duration = 30;
          else if (urgency.includes("Priority")) duration = 60;

          setUrgencyDuration(duration);
        }


        const newHospitalName = data.hospitalName || hospitalName;
        const status = data.status?.toLowerCase();

        if (status === 'accepted' && !driverAssigned) {
          const acceptedMsg = `✅ Request Accepted by ${newHospitalName}. Assigning driver...`;

          appendStatusMessage(acceptedMsg);
          setHospitalName(newHospitalName);
        }

        else if (
          status === 'assigned' ||
          status === 'assigned_by_individual_driver' ||
          (data.driverType === 'IndependentDriver' && status === 'searching')
        ) {
          const isIndependentDriver =
            status === 'assigned_by_individual_driver' || data.driverType === 'IndependentDriver';

          // Prefer array of drivers if present
          if (Array.isArray(data.assignedDrivers)) {
            // Get all assigned drivers
            const allAssignedDrivers = data.assignedDrivers || [];

            // Also track which ones are from this partner (for display purposes)
            const assignedByThisPartner = allAssignedDrivers.filter(
              d => d.partnerId?.toString() === hospital?._id?.toString()
            );

            // Set all assigned drivers to state regardless of partner
            setAssignedDrivers(allAssignedDrivers);
            setDriverAssignedCount(allAssignedDrivers.length);

          } else if (data.assignedDrivers) {
            // Single driver case
            setAssignedDrivers([data.assignedDrivers]);
            setDriverAssignedCount(1);
          }

          // Fetch total ambulances needed from backend (only once)
          if (data.numberOfAmbulancesRequested && data.numberOfAmbulancesRequested !== driverTotalNeeded) {
            setDriverTotalNeeded(data.numberOfAmbulancesRequested);
          }

          const assignedMsg = isIndependentDriver
            ? `✅ Individual driver assigned`
            : `✅ Driver assigned by ${newHospitalName}`;

          appendStatusMessage(assignedMsg);

          // Check if all required ambulances are assigned
          if (
            Array.isArray(data.assignedDrivers) &&
            data.numberOfAmbulancesRequested &&
            data.assignedDrivers?.length >= data.numberOfAmbulancesRequested
          ) {
            setDriverAssigned(true);
            setIsHospitalSelectionRequired(false); // No need to select more hospitals
            clearInterval(intervalRef.current); // stop polling

            // Add a completion message if not already present
            const completionMsg = `✅ All ${data.numberOfAmbulancesRequested} ambulances have been assigned.`;
            appendStatusMessage(completionMsg);
          }
        }

        else if (status === "partially_assigned") {
          // Get all assigned drivers regardless of partner
          const allAssignedDrivers = data.assignedDrivers || [];
          const currentHospitalId = data.hospitalId || hospital?._id;

          // Get drivers assigned by the current partner
          const assignedByThisPartner = allAssignedDrivers.filter(
            d => d.partnerId?.toString() === currentHospitalId?.toString()
          );

          // Set all assigned drivers to state
          setAssignedDrivers(allAssignedDrivers);
          setDriverAssignedCount(allAssignedDrivers.length);

          if (data.numberOfAmbulancesRequested) {
            setDriverTotalNeeded(data.numberOfAmbulancesRequested);
          }

          const assignedCount = assignedByThisPartner.length;

          // FIXED: estimate requested count from this hospital by comparing current + remainingNeeded
          const reassignedFromThisHospital = data.reassignedPartners?.filter(p => p.partnerId === hospital?._id)?.[0]?.count;
          // ✅ Estimate how many were requested from this hospital
          let requestedFromThisHospital = 0;

          // Use reassignedPartners info if available
          if (data.reassignedPartners && Array.isArray(data.reassignedPartners)) {
            const entry = data.reassignedPartners.find(p => p.partnerId === hospital?._id);

            if (entry) {
              requestedFromThisHospital = entry.count;
            }
          }

          // If not available, fallback to: how many this hospital has assigned + how many are still pending
          if (!requestedFromThisHospital) {
            requestedFromThisHospital = assignedByThisPartner.length + data.remainingAmbulances;
          }

          const partialMsg = `⚠️ Only ${assignedByThisPartner.length} of ${data.remainingAmbulances + 1} ambulances assigned by ${data.hospitalName || hospitalName}.❗ Not all ambulances are assigned. Please select another hospital for the remaining. `;
          appendStatusMessage(partialMsg);

          // Start countdown for reassignment if needed
          if (
            !isHospitalSelectionRequired &&
            nearbyHospitals.length > 0 &&
            data.numberOfAmbulancesRequested &&
            allAssignedDrivers.length < data.numberOfAmbulancesRequested
          ) {
            setIsHospitalSelectionRequired(true);

            // Start timer for auto-reassignment only if not already set
            if (!timerStart) {
              const start = Date.now();
              setTimerStart(start);

              let duration = 120;
              if (urgency.includes("Life-threatening")) duration = 30;
              else if (urgency.includes("Priority")) duration = 60;

              setUrgencyDuration(duration);
            }

            setTimerStart(Date.now());

            if (data.nearbyHospitals?.length && data?.pickupCoordinates) {

              const enriched = await enrichHospitals(data.nearbyHospitals, {
                lat: data.pickupCoordinates[1],
                lng: data.pickupCoordinates[0],
              });

              if (enriched?.length) {
                setNearbyHospitals(enriched);
              }
            }
          }
        }
        else if (
          (status === "rejected") &&
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

            if (enriched?.length) {
              setNearbyHospitals(enriched);
            }
          }

          setIsHospitalSelectionRequired(true);

          // Start timer only on rejection
          if (!timerStart) {
            const start = Date.now();
            setTimerStart(start);

            let duration = 120;
            if (urgency.includes("Life-threatening")) duration = 30;
            else if (urgency.includes("Priority")) duration = 60;

            setUrgencyDuration(duration);
          }

          const rejectedBy = data.hospitalName || hospitalName || "Unknown Hospital";
          const pendingMsg = `❗ Request rejected by ${rejectedBy}. Please select another hospital.`;

          appendStatusMessage(pendingMsg);
        }
      } catch (err) {
        console.error('Status fetch error:', err);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [bookingId, hospitalName, timerStart, urgencyDuration, isHospitalSelectionRequired]);

  const handleHospitalSelection = async (selectedHospitalId) => {
    if (isReassigning) return;
    setIsReassigning(true);

    try {
      // Get the total number of assigned ambulances across all partners
      const totalAssigned = data.assignedDrivers?.length || 0;

      // Calculate how many more ambulances we need
      const remainingNeeded = data.numberOfAmbulancesRequested - totalAssigned;

      if (remainingNeeded <= 0) {
        alert("All required ambulances have already been assigned.");
        setIsHospitalSelectionRequired(false);
        return;
      }

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
          driverAssigned,
          remainingAmbulances: remainingNeeded,
          numberOfAmbulancesRequested: remainingNeeded
        }),
      });

      const result = await res.json();

      if (res.ok) {
        // Find the selected hospital name from our list
        const selectedHospital = nearbyHospitals.find(h => h._id === selectedHospitalId);
        const hospitalName = selectedHospital?.name || result.reassignedRequest?.hospitalName || "selected hospital";

        // Get the correct count of ambulances being reassigned
        const count = remainingNeeded;

        const ambulanceWord = count === 1 ? 'ambulance request is' : 'ambulance requests are';
        const resendMsg = `✅ ${count} ${ambulanceWord} resent to ${hospitalName}`;

        appendStatusMessage(resendMsg);
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

  useEffect(() => {
    if (!driverAssigned && data?.driverName) {
      setAssignedDrivers([{
        name: data.driverName,
        plate: data.ambulancePlateNumber,
        otp: data.otp,
        phone: data.phone,
        driverType: data.driverType
      }]);
      setDriverAssigned(true);
    }
  }, [data]);

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
      drivers: assignedDrivers,
      otp: data?.otp,
      pickup: pickupLocation,
      destination: destinationLocation,
      fare: totalFare,
      driverType: data.driverType,
      status: data.status
    };

    navigate('/waiting-for-driver', {
      state: { ride, hospital: hospitalData, ambulanceType },
    });
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

        {timerStart && isHospitalSelectionRequired && (
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
                if (
                  data.assignedDrivers?.length < data.numberOfAmbulancesRequested &&
                  nearbyHospitals.length > 0
                ) {
                  const triedHospitals = (data?.reassignedPartners || []).map(p => p.partnerId);

                  const availableHospitals = nearbyHospitals.filter(
                    h => !triedHospitals.includes(h._id)
                  );

                  if (availableHospitals.length > 0) {
                    const nextHospital = availableHospitals[0]; // pick first available

                    handleHospitalSelection(nextHospital._id); // Auto trigger reassignment
                  }
                }

                return [false, 0];
              }}

            >
              {({ remainingTime }) => <div style={{ fontSize: "18px" }}>{remainingTime}s</div>}
            </CountdownCircleTimer>
          </div>
        )}

        {isHospitalSelectionRequired && (
          <div className="hospital-selection-card-list">
            {nearbyHospitals
              .filter(partner => {
                const alreadyTried = data?.reassignedPartners?.some(
                  reassigned => reassigned.partnerId === partner._id
                );
                return !alreadyTried;
              }).map(partner => (
                <div key={partner._id} className="hospital-selection-hospital-card">
                  <p><strong>{partner.name}</strong></p>
                  <p>📍 {partner.address}</p>
                  <p>📏 Distance: {partner.distance} km away</p>
                  <p>⏱ ETA: {partner.duration} </p>
                  <p>💰 Cost: {partner.cost}</p>
                  <button
                    disabled={isReassigning}
                    onClick={() => handleHospitalSelection(partner._id)}
                  >
                    {isReassigning ? "Assigning..." : "Select This Hospital"}
                  </button>
                </div>
              ))}
          </div>
        )
        }

        {driverAssignedCount >= driverTotalNeeded && (
          <button className="driver-detail-button fade-in" onClick={handleDriverDetails}>
            View Driver Details
          </button>
        )}
      </div>
    </div>
  );
};

export default LookingForDriver;