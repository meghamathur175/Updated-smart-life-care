import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaAmbulance } from 'react-icons/fa';
import '../styles/LookingForDriver.css';

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

        else if (["reassigned", "rejected & reassigned"].includes(status)) {
          if (newHospitalName !== hospitalName) {
            const rejectedMsg = `❌ Rejected by ${hospitalName}. Reassigned to ${newHospitalName}`;
            setHospitalName(newHospitalName);
            setStatusList((prev) => {
              if (!prev.includes(rejectedMsg)) {
                const updated = [...prev, rejectedMsg];
                localStorage.setItem(`statusList_${bookingId}`, JSON.stringify(updated));
                return updated;
              }
              return prev;
            });
          }
        }

        else if (status === 'assigned') {
          setDriver({
            name: data.driverName,
            plate: data.ambulancePlateNumber,
            otp: data.otp,
            phone: data.phone,
          });

          const assignedMsg = `✅ Driver assigned by ${newHospitalName}`;
          setStatusList((prev) => {
            if (!prev.includes(assignedMsg)) {
              const updated = [...prev, assignedMsg];
              localStorage.setItem(`statusList_${bookingId}`, JSON.stringify(updated));
              return updated;
            }
            return prev;
          });

          setDriverAssigned(true);
          clearInterval(interval); // Do NOT clear localStorage here
        }
      } catch (err) {
        console.error('Status fetch error:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingId, hospitalName]);

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
      captain: { fullname: { firstname: driver.name }, vehicle: { plate: driver.plate } },
      otp: data?.otp,
      pickup: pickupLocation,
      destination: destinationLocation,
      fare: totalFare,
      phone: driver.phone,
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
                <span className={`dot ${index === statusList.length - 1 ? 'filled' : ''}`}></span>
                <p>{msg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Assigned UI */}
        {driverAssigned && (
          <>
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
