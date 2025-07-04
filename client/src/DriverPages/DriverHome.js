// DriverHome.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import '../styles/DriverHome.css';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer
} from "@react-google-maps/api";

const socket = io("http://localhost:3001");

const DriverHome = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [timer, setTimer] = useState(120);
  const [manualLocation, setManualLocation] = useState({ lng: "", lat: "" });
  const [locationStatus, setLocationStatus] = useState("Fetching current location...");
  const [currentAddress, setCurrentAddress] = useState("");
  const [address, setAddress] = useState("");
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [driverLatLng, setDriverLatLng] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

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
            console.log("Route details: ", leg);
            resolve({
              directions: result,
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
    const driver = JSON.parse(localStorage.getItem("driver"));
    if (driver?._id) {
      socket.emit("register_driver", driver._id);
    }

    const handleNewRequest = async (data) => {
      console.log("New incoming req data: ", data);
      setTimer(120);
      setShowPopup(true);

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
      } catch (err) {
        console.warn("Failed to get current location:", err);
        // fallback or leave driverCoords null
      }

      try {
        const geocoder = new window.google.maps.Geocoder();
        const geocodeResults = await new Promise((resolve, reject) =>
          geocoder.geocode({ address: data.pickup }, (results, status) => {
            if (status === "OK" && results[0]) resolve(results);
            else reject(status);
          })
        );

        const pickupCoords = geocodeResults[0].geometry.location;

        if (driverCoords) {
          const { directions, eta, distance } = await getRouteDetails(driverCoords, pickupCoords);
          setDirectionsResponse(directions);
          setIncomingRequest({ ...data, eta, pickupDistanceKm: distance });
          return;
        }
      } catch (error) {
        console.warn("Error fetching route details:", error);
      }

      // Fallback to showing basic popup
      setDirectionsResponse(null);
      setIncomingRequest(data);
    };

    const handleRequestTaken = ({ requestId }) => {
      if (incomingRequest?.requestId === requestId) {
        setIncomingRequest(null);
        setShowPopup(false);
      }
    };

    socket.on("new_request", handleNewRequest);
    socket.on("request_taken", handleRequestTaken);

    return () => {
      socket.off("new_request", handleNewRequest);
      socket.off("request_taken", handleRequestTaken);
    };
  }, []);

  useEffect(() => {
    if (!incomingRequest || timer === 0) {
      setShowPopup(false);
      setIncomingRequest(null);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, incomingRequest]);

  useEffect(() => {
    const driver = JSON.parse(localStorage.getItem("driver"));
    if (!driver?._id) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          setDriverLatLng(coords);
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === "OK" && results[0]) {
              setCurrentAddress(results[0].formatted_address);
            }
          });
          setLocationStatus("Detected your current location below. If it looks incorrect, enter your address manually.");
          axios.post("http://localhost:3001/api/drivers/update-location", {
            driverId: driver._id,
            lng: longitude,
            lat: latitude,
          });
        },
        () => {
          setLocationStatus("Location access denied. Please enter your address below.");
        }
      );
    } else {
      setLocationStatus("Geolocation not supported.");
    }
  }, []);

  const handleAddressSelect = async (value) => {
    setAddress(value);
    try {
      const results = await geocodeByAddress(value);
      const { lat, lng } = await getLatLng(results[0]);
      setManualLocation({ lng: parseFloat(lng), lat: parseFloat(lat), label: value });
      setDriverLatLng({ lat: manualLocation.lat, lng: manualLocation.lng });
      console.log("Manual location being sent:", manualLocation);

    } catch {
      alert("Failed to get coordinates for this address.");
    }
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    const driver = JSON.parse(localStorage.getItem("driver"));
    if (!driver?._id) return;
    if (!manualLocation.lng || !manualLocation.lat) {
      alert("Select a valid address.");
      return;
    }
    await axios.post("http://localhost:3001/api/drivers/update-location", {
      driverId: driver._id,
      lng: manualLocation.lng,
      lat: manualLocation.lat,
    });
    setLocationStatus("Manual location updated successfully.");
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat: manualLocation.lat, lng: manualLocation.lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setCurrentAddress(results[0].formatted_address);
        setDriverLatLng({ lat: manualLocation.lat, lng: manualLocation.lng });
      }
    });

    alert("Location updated!");
    setAddress("");
  };

  const handleAccept = () => {
    const driver = JSON.parse(localStorage.getItem("driver"));
    socket.emit("accept_request", {
      requestId: incomingRequest.requestId,
      driverId: driver._id,
    });
    setIncomingRequest(null);
    setShowPopup(false);
  };

  const handleReject = () => {
    setIncomingRequest(null);
    setShowPopup(false);
  };

  useEffect(() => {
    if (incomingRequest) {
      console.log("Updated incomingRequest: ", incomingRequest);
    }
  }, [incomingRequest]);

  return (
    <div className="driver-dashboard-container">
      <h3>Driver Dashboard</h3>
      <div className="location-info">
        <strong>{locationStatus}</strong>
        {manualLocation.label
          ? <div className="current-address">📍 {manualLocation.label}</div>
          : currentAddress && <div className="current-address">📍 {currentAddress}</div>
        }

      </div>

      {isLoaded && (
        <form onSubmit={handleManualLocationSubmit} className="manual-location-form">
          <PlacesAutocomplete value={address} onChange={setAddress} onSelect={handleAddressSelect}>
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


      {/* Popup */}
      {showPopup && incomingRequest && (
        <div className="driver-dashboard-overlay">
          <div className="driver-dashboard-popup">
            <button className="deny-button" onClick={handleReject}>✕ Deny</button>
            <div className="map-placeholder">
              {isLoaded && directionsResponse && (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "220px", borderRadius: "10px" }}
                  zoom={13}
                  center={driverLatLng || { lat: 20.59, lng: 78.96 }}
                >
                  <DirectionsRenderer
                    directions={directionsResponse}
                    options={{
                      suppressMarkers: false,
                      polylineOptions: { strokeColor: "#00a859", strokeWeight: 5 }
                    }}
                  />
                </GoogleMap>
              )}
            </div>
            <div className="popup-card">
              <div className="order-header">
                <span className="new-order-badge">New Ride</span>
                <h2>Estimated earnings:</h2>
                <div className="earnings">₹{incomingRequest.ambulanceCost}</div>
                <div className="pickup-drop-details">
                  <div><strong>Pickup:</strong> {incomingRequest.pickup || '...'}</div>
                  <div><strong>Drop:</strong> {incomingRequest.drop || '...'}</div>
                  <div><strong>Distance:</strong> {incomingRequest.pickupDistanceKm || '...'}</div>
                </div>

              </div>
              <div className="pickup-details">
                {incomingRequest.urgency && (
                  <div className="emergency-type">
                    🚨 <strong>Emergency:</strong> {incomingRequest.urgency || "N/A"}
                  </div>
                )}
                {incomingRequest.eta && <div className="eta">🕒 {incomingRequest.eta} away</div>}
              </div>
              <button className="accept-button" onClick={handleAccept} disabled={timer === 0}>
                Accept
              </button>
              <div className="timer-bar">
                <span>⏳ {timer}s</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverHome;