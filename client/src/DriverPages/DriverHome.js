import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import '../styles/DriverHome.css';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import driverImg from '../images/I2.webp';
import driverLocationIcon from "../images/driver_location3.png";

const socket = io("http://localhost:3001");
const driver = JSON.parse(localStorage.getItem("driver"));

socket.on("connect_error", (err) => {
  console.error("Socket.IO connection error:", err.message);
});

const DriverHome = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [timer, setTimer] = useState(120);
  const [manualLocation, setManualLocation] = useState({ lng: "", lat: "" });
  const [locationStatus, setLocationStatus] = useState("Fetching current location...");
  const [currentAddress, setCurrentAddress] = useState("");
  const [address, setAddress] = useState("");
  const [driverLatLng, setDriverLatLng] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [acceptedRequestId, setAcceptedRequestId] = useState(null);
  const [waitingForAssign, setWaitingForAssign] = useState(false);
  const [driverStatus, setDriverStatus] = useState("offline");

  const googleMapsLibraries = ["places"];
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: googleMapsLibraries,
  });

  useEffect(() => {
    if (driverLatLng) setMapCenter(driverLatLng);
  }, [driverLatLng]);

  const getRouteDetails = async (origin, destination) => {
    return new Promise((resolve, reject) => {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            const leg = result.routes[0].legs[0];
            resolve({
              eta: leg.duration.text,
              distance: leg.distance.text,
            });
          } else {
            reject(status);
          }
        }
      );
    });
  };

  useEffect(() => {
    if (driver?._id) socket.emit("register_driver", driver._id);
    console.log("🔌 Registering driver with ID:", driver._id);

    axios.get(`http://localhost:3001/api/drivers/${driver._id}`).then((res) => {
      setDriverStatus(res.data.status || "offline");
    });

    const handleNewRequest = async (data) => {
      console.log("📦 Received new request via socket:", data);
      console.log("✅ Current driver status:", driverStatus);

      if (driverStatus !== "online") return;
      setTimer(120);
      setWaitingForAssign(false);
      setAcceptedRequestId(null);

      let driverCoords = null;
      try {
        const position = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );
        driverCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDriverLatLng(driverCoords);
        console.log("setDriverCoords in useEffect: ", driverCoords);
      } catch (err) { }

      try {
        const geocoder = new window.google.maps.Geocoder();

        const geocodePickup = await new Promise((resolve, reject) =>
          geocoder.geocode({ address: data.pickup }, (results, status) => {
            if (status === "OK" && results[0]) resolve(results);
            else reject(status);
          })
        );
        const pickupCoords = geocodePickup[0].geometry.location;

        const geocodeDrop = await new Promise((resolve, reject) =>
          geocoder.geocode({ address: data.drop }, (results, status) => {
            if (status === "OK" && results[0]) resolve(results);
            else reject(status);
          })
        );
        const dropCoords = geocodeDrop[0].geometry.location;

        let driverToPickupDistance = "", driverToPickupEta = "";
        if (driverCoords) {
          const { distance, eta } = await getRouteDetails(driverCoords, pickupCoords);
          driverToPickupDistance = distance;
          driverToPickupEta = eta;
        }

        const { distance, eta } = await getRouteDetails(pickupCoords, dropCoords);
        setIncomingRequest({
          ...data,
          driverToPickupDistance,
          driverToPickupEta,
          pickupToDropDistance: distance,
          pickupToDropEta: eta,
        });
      } catch (error) {
        setIncomingRequest(data);
      }
    };

    const handleRequestTaken = ({ requestId, driverId }) => {
      if (
        (acceptedRequestId === requestId && driver._id === driverId) ||
        (incomingRequest?.requestId === requestId)
      ) {
        setShowPopup(false);
        setIncomingRequest(null);
        setAcceptedRequestId(null);
        setWaitingForAssign(false);
      }
    };

    socket.on("new_request", handleNewRequest);
    socket.on("request_taken", handleRequestTaken);
    return () => {
      socket.off("new_request", handleNewRequest);
      socket.off("request_taken", handleRequestTaken);
    };
  }, [acceptedRequestId, incomingRequest, isLoaded]);

  useEffect(() => {
    if (incomingRequest) {
      setShowPopup(true);
    }
  }, [incomingRequest]);

  useEffect(() => {
    if (!incomingRequest) return;
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, incomingRequest]);

  useEffect(() => {
    if (!driver?._id) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setDriverLatLng(coords);

          if (isLoaded) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: coords }, (results, status) => {
              if (status === "OK" && results[0]) {
                setCurrentAddress(results[0].formatted_address);
              }
            });
          }

          setLocationStatus("Detected your current location below. If it looks incorrect, enter your address manually.");

          await axios.post("http://localhost:3001/api/drivers/update-location", {
            driverId: driver._id,
            lng: coords.lng,
            lat: coords.lat,
          });
        },
        () => setLocationStatus("Location access denied. Please enter your address below.")
      );
    } else {
      setLocationStatus("Geolocation not supported.");
    }
  }, [isLoaded]);

  const handleAddressSelect = async (value) => {
    setAddress(value);
    try {
      const results = await geocodeByAddress(value);
      if (!results || results.length === 0) {
        alert("No matching address found. Please enter a more precise location.");
        return;
      }
      const { lat, lng } = await getLatLng(results[0]);
      const coords = { lat: parseFloat(lat), lng: parseFloat(lng), label: value };
      setManualLocation(coords);
      setDriverLatLng({ lat: coords.lat, lng: coords.lng });
    } catch (err) {
      console.error("Error in geocodeByAddress:", err);
      alert("Failed to get coordinates for this address.");
    }
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    if (!manualLocation.lat || !manualLocation.lng) {
      alert("Select a valid address.");
      return;
    }

    await axios.post("http://localhost:3001/api/drivers/update-location", {
      driverId: driver._id,
      lng: manualLocation.lng,
      lat: manualLocation.lat,
    });

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: manualLocation }, (results, status) => {
      if (status === "OK" && results[0]) {
        setCurrentAddress(results[0].formatted_address);
        setDriverLatLng({ lat: manualLocation.lat, lng: manualLocation.lng });
        setLocationStatus("Manual location updated successfully.");
      }
    });

    alert("Location updated!");
    setAddress("");
  };

  const handleAccept = async () => {
    await axios.post("http://localhost:3001/api/drivers/update-status", {
      driverId: driver._id,
      status: "busy",
    });
    setDriverStatus("busy");

    socket.emit("accept_request", {
      requestId: incomingRequest.requestId,
      driverId: driver._id,
    });

    setAcceptedRequestId(incomingRequest.requestId);
    setWaitingForAssign(true);
    setShowPopup(false);
  };

  const handleReject = () => {
    setIncomingRequest(null);
    setShowPopup(false);
    setWaitingForAssign(false);
  };

  const changeDriverStatus = async (status) => {
    try {
      await axios.post("http://localhost:3001/api/drivers/update-status", {
        driverId: driver._id,
        status,
      });
      setDriverStatus(status);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="driver-dashboard-wrapper">

      {/* Google Map full screen */}
      {isLoaded && (
        <div className="fullscreen-map">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter || { lat: 26.9124, lng: 75.7873 }}
            zoom={15}
          >
            {isLoaded && driverLatLng ? (
              <Marker
                position={driverLatLng}
                icon={{
                  url: driverLocationIcon,
                  scaledSize: new window.google.maps.Size(46, 46),
                }}
                title="Driver Location"
              />
            ) : (
              console.log("⛔️ Marker not rendering: driverLatLng not available.")
            )}

          </GoogleMap>
        </div>
      )}

      {/* Overlay card (Profile + Address + Controls) */}
      <div className="driver-overlay-content">
        <div className="driver-profile">
          <img src={driverImg} alt="Driver" className="driver-avatar" />
          <div>
            <h2 className="driver-name">{driver?.name || "Driver Name"}</h2>
            <p className={`driver-status-badge ${driverStatus}`}>{driverStatus.toUpperCase()}</p>
          </div>
        </div>

        <div className="driver-status-toggle">
          <button className={`status-btn ${driverStatus === "online" ? "active" : ""}`} onClick={() => changeDriverStatus("online")}>Go Online</button>
          <button className={`status-btn ${driverStatus === "offline" ? "active" : ""}`} onClick={() => changeDriverStatus("offline")}>Go Offline</button>
        </div>

        <div className="location-info">
          <strong>{locationStatus}</strong>
          {manualLocation.label
            ? <div className="current-address">📍 {manualLocation.label}</div>
            : currentAddress && <div className="current-address">📍 {currentAddress}</div>
          }
        </div>

        {/* Manual location form */}
        {isLoaded && (
          <form onSubmit={handleManualLocationSubmit} className="manual-location-form">
            <PlacesAutocomplete
              value={address}
              onChange={setAddress}
              onSelect={handleAddressSelect}
              searchOptions={{
                componentRestrictions: { country: ["in"] }
              }}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                <div className="autocomplete-wrapper">
                  <input {...getInputProps({ placeholder: "Enter address..." })} />
                  <div className="suggestions-list">
                    {suggestions.map((s) => (
                      <div {...getSuggestionItemProps(s)} key={s.placeId}>{s.description}</div>
                    ))}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
            <button type="submit">Update Location</button>
          </form>
        )}
      </div>

      {/* Ride Request Popup */}
      {/* Incoming request popup */}
      {showPopup && incomingRequest && (
        <div className="driver-dashboard-overlay">
          <div className="driver-dashboard-popup">
            <button className="deny-button" onClick={handleReject}>✕</button>
            <div className="popup-card">
              <div className="order-header">
                <div className="driver-order">
                  <span className="new-order-badge">New Ride</span>
                  <h2>Estimated earnings:</h2>
                  <div className="earnings">₹{incomingRequest.ambulanceCost}</div>
                </div>
                <div className="pickup-drop-timeline">
                  <div className="timeline-column">
                    <div className="timeline-dot pickup-dot" />
                    <div className="timeline-line" />
                    <div className="timeline-dot drop-dot" />
                  </div>
                  <div className="timeline-details">
                    <div className="timeline-block">
                      <div className="timeline-time">{incomingRequest.driverToPickupEta || '...'} ({incomingRequest.driverToPickupDistance || '...'}) away</div>
                      <div className="timeline-address">{incomingRequest.pickup}</div>
                    </div>
                    <div className="timeline-block">
                      <div className="timeline-time">{incomingRequest.pickupToDropEta || '...'} ({incomingRequest.pickupToDropDistance || '...'}) trip</div>
                      <div className="timeline-address">{incomingRequest.drop}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pickup-details">
                {incomingRequest.urgency && (
                  <div className="emergency-type">
                    🚨 <strong>Emergency:</strong> {incomingRequest.urgency}
                  </div>
                )}
              </div>
              <button className="accept-button" onClick={handleAccept} disabled={timer === 0 || waitingForAssign}>
                {waitingForAssign ? "Waiting for confirmation..." : "Accept"}
              </button>
              <div className="timer-bar"><span>⏳ {timer}s</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default DriverHome;
