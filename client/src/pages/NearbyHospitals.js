import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import "../styles/BookAmbulance.css";
import pickupIcon from "../images/pickup-icon.png";
import dropOffIcon from "../images/drop-off-icon.png";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

function BookAmbulance() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);
  const hospital = state?.hospital;
  const pickupLocation = state?.pickupLocation;
  const destinationLocation = state?.destAddress;

  // pickupLocation is address string, so geocode it to lat/lng for marker
  const [pickupCoords, setPickupCoords] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  // Geocode pickup location to coordinates
  const geocodePickup = useCallback(() => {
    if (!pickupLocation || !isLoaded) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: pickupLocation }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        setPickupCoords({ lat: location.lat(), lng: location.lng() });
      } else {
        console.error("Failed to geocode pickup location:", status);
        setPickupCoords(null);
      }
    });
  }, [pickupLocation, isLoaded]);

  // destination location address is string, so geocode it to lat/lng for marker
  const [destinationCoords, setdestinationCoords] = useState(null);

  // Geocode destination location to coordinates
  const geocodeDestination = useCallback(() => {
    if (!destinationLocation || !isLoaded) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destinationLocation }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        setdestinationCoords({ lat: location.lat(), lng: location.lng() });
      } else {
        console.error("Failed to geocode pickup location:", status);
        setdestinationCoords(null);
      }
    });
  }, [destinationLocation, isLoaded]);

  const calculateRoute = useCallback(() => {
    if (!hospital || !pickupCoords || !isLoaded) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickupCoords,
        destination: hospital.vicinity,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirectionsResponse(result);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [hospital, pickupCoords, isLoaded]);

  const navigateToTrackAmbulancePage = () => {
    setNavigating(true);

    setTimeout(() => {
      navigate("/track-ambulance");
    }, 1000);
  }

  useEffect(() => {
    if (pickupLocation) geocodePickup();
  }, [geocodePickup]);

  useEffect(() => {
    if (destinationLocation) geocodeDestination();
  }, [geocodeDestination]);


  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const handleBookAmbulance = () => {
    setShowPopup(true);
  };

  const handlePaymentMethod = () => {
    setShowPaymentMethod(true);
  }

  if (loadError) return <div>Error loading map</div>;
  // if (!isLoaded) return <div>Loading map...</div>;
  if (!isLoaded) {
  return (
    <div className="map-loading">
      <div className="map-loading-spinner" />
      <p>Loading map...</p>
    </div>
  );
}

  // Default center: use pickupCoords if available, else fallback to India center
  const centerPosition = pickupCoords || { lat: 20.5937, lng: 78.9629 };

  return (
    <div className="google-maps-layout">
      <div className="sidebar">
        <h2>Book Ambulance</h2>
        <div className="info">
          <p>
            <strong>Pickup:</strong> {pickupLocation}
          </p>
          {hospital ? (
            <>
              <p>
                <strong>Destination:</strong> {destinationLocation}
              </p>
              <p>
                <strong>Hospital Address:</strong> {hospital.vicinity}
              </p>
              <p>
                <strong>Distance:</strong> {hospital.distance}
              </p>
              <p>
                <strong>Duration:</strong> {hospital.duration}
              </p>
              <p>
                <strong>Estimated Cost:</strong> {hospital.cost}
              </p>
              <p>
                <strong>Rating:</strong> {hospital.rating || "Not Available"}
              </p>
            </>
          ) : (
            <p>No hospital selected.</p>
          )}
        </div>
        <button className="payment-method-btn" onClick={handlePaymentMethod}>Add Payment Method</button>
        <button className="book-btn" onClick={handleBookAmbulance}>Book Ambulance</button>
      </div>

      <div className="book-map-container">
        <GoogleMap mapContainerStyle={containerStyle} zoom={13} center={centerPosition}>
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} options={{ suppressMarkers: true }} />
          )}

          {/* Pickup Marker */}
          {pickupCoords && (
            <Marker
              position={pickupCoords}
              icon={{
                url: pickupIcon,
                scaledSize: new window.google.maps.Size(46, 46),
              }}
              title="Pickup Location"
            />
          )}

          {/* Hospital Marker */}
          {destinationCoords && (
            <Marker
              position={destinationCoords}
              icon={{
                url: dropOffIcon,
                scaledSize: new window.google.maps.Size(46, 46),
              }}
              title="Hospital Location"
            />
          )}
        </GoogleMap>
      </div>

      {showPaymentMethod && (
        <div className="payment-method">
          <div className="payment-method-content">
            <h1>Add payment method</h1>
            <div className="cash-method">Cash</div>
            <div className="card-method">Card</div>

            <button className="book-cancel-btn" onClick={() => setShowPaymentMethod(false)}>
              Cancel
            </button>
          </div>
        </div>
      )
      }

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="checkmark">✔️</span>
            <h3>Ambulance Booked!</h3>
            {navigating && (
              <div className="book-overlay">
                <div className="book-spinner" aria-label="Navigating to booking page"></div>
                <p>Redirecting to track ambulance page...</p>
              </div>
            )
            }
            <button className="track-btn" onClick={navigateToTrackAmbulancePage}>
              Track Ambulance
            </button>
            <button className="book-cancel-btn" onClick={() => setShowPopup(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookAmbulance;
