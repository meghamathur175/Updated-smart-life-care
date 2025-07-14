import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaAmbulance } from 'react-icons/fa';
import '../styles/LookingForDriver.css';
import 'remixicon/fonts/remixicon.css';

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

  // Polling status updates every second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/partners/request-status/booking-id/${bookingId}`);
        const data = await res.json();
        setData(data);
        console.log("DATA from req-status: ", data);
        
        const newHospitalName = data.hospitalName || hospitalName;
        const status = data.status?.toLowerCase();

        if (status === 'accepted') {
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
          const isIndependentDriver = status === "assigned_by_individual_driver" || data.driverType === "IndependentDriver";

          setDriver({
            name: data.driverName,
            plate: data.ambulancePlateNumber,
            otp: data.otp,
            phone: data.phone,
          });

          const assignedMsg = isIndependentDriver ? `✅ Individual driver assigned` : `✅ Driver assigned by ${newHospitalName}`;

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
          data.nearbyHospitals.length > 0
        ) {
          setNearbyHospitals(data.nearbyHospitals);
          console.log("data.nearbyHospitals: ", data.nearbyHospitals);

          setIsHospitalSelectionRequired(true);

          setStatusList((prev) => {
            const rejectedBy = data.hospitalName || hospitalName || "Unknown Hospital";
            const pendingMsg = `❗ Request rejected by ${rejectedBy}. Please select another hospital.`;

            if (!prev.includes(pendingMsg)) {
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
      console.log("RESULTS from confirm-hospital: ", result);

      if (res.ok) {
        setStatusList((prev) => {
          const prevHospitalName = result.prevHospitalName || "Unknown Hospital";
          const reassignedTo = result.reassignedRequest?.hospitalName || result.reassignedRequest?.hospital || "selected hospital";

          const updated = [
            ...prev,
            `❗ Request rejected by ${prevHospitalName}. Please select another hospital.`,
            `✅ Resended to ${reassignedTo}`,
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
                  className={`dot ${index === statusList.length - 1 ? 'filled pulse' : ''}`}
                />
                <p>{msg}</p>
              </div>
            ))}
          </div>
        </div>

        {nearbyHospitals.length > 0 && (
          <div className="hospital-selection-container">
            <h3 className="hospital-selection-timeline-heading">Select a Hospital</h3>
            {nearbyHospitals.map(hospital => (
              <div key={hospital._id} className="hospital-selection-hospital-card">
                <p><strong>{hospital.name}</strong></p>
                <p>📍 {hospital.address}</p>
                <p>📏 {(hospital.distance/ 1000).toFixed(1)} km away</p>
                <button
                  disabled={isReassigning}
                  onClick={() => handleHospitalSelection(hospital._id)}
                >
                  {isReassigning ? "Assigning..." : "Select This Hospital"}
                </button>
              </div>
            ))}
          </div>
        )}

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
