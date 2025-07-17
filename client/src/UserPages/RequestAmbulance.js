import React, { useRef, useEffect, useState } from "react";
import "../styles/RequestAmbulance.css";
import { useNavigate } from "react-router-dom";

function RequestAmbulance() {
  const pickupRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const geocoderRef = useRef(null);

  const loadGoogleMapsScript = (callback) => {
    if (window.google && window.google.maps) {
      callback();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = callback;
      document.body.appendChild(script);
    }
  };

  useEffect(() => {
  const initializeMap = () => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps is not available.");
      return;
    }

    const mapElement = document.getElementById("map");
    const inputElement = pickupRef.current;

    if (!mapElement || !inputElement) {
      console.error("DOM elements not ready.");
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      });

      const map = new window.google.maps.Map(mapElement, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
      });

      mapRef.current = map;
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
      });

      geocoderRef.current = new window.google.maps.Geocoder();
    } catch (err) {
      console.error("Google Maps initialization error:", err);
    }
  };

  const loadScript = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeMap();
      return;
    }

    const existingScript = document.querySelector("script[src*='maps.googleapis']");
    if (existingScript) {
      existingScript.addEventListener("load", initializeMap);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = initializeMap;
    script.onerror = () => {
      console.error("Failed to load Google Maps script.");
    };

    document.body.appendChild(script);
  };

  loadScript();

  return () => {
    document.body.classList.remove("menu-open");
  };
}, []);


  const fetchNearbyHospitals = () => {
    const address = pickupRef.current.value.trim();
    if (!address) {
      alert("Please enter a pickup location.");
      return;
    }

    setNavigating(true);
    setTimeout(() => {
      navigate("/nearby-hospitals", {
        state: {
          pickup: address,
        },
      });
    }, 1000);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latLng = { lat: latitude, lng: longitude };

          // Update map center and add marker
          if (mapRef.current) {
            mapRef.current.setCenter(latLng);
            mapRef.current.setZoom(15);

            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            markerRef.current = new window.google.maps.Marker({
              position: latLng,
              map: mapRef.current,
              title: "Your Location",
            });
          }

          // Reverse geocode coordinates to address
          if (geocoderRef.current) {
            geocoderRef.current.geocode({ location: latLng }, (results, status) => {
              if (status === "OK" && results[0]) {
                pickupRef.current.value = results[0].formatted_address;
              } else {
                alert("Unable to find address for your location.");
              }
            });
          }
        },
        (error) => {
          console.error(error);
          alert("Unable to fetch your location. Please allow location access.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="request-layout">
      <div className="content-container">
        <div className="map-section">
          <div id="map"></div>
        </div>

        <div className="form-section">
          <div className="form-box">
            <h2>Find Nearby Hospitals 🚑</h2>
            <input
              ref={pickupRef}
              type="text"
              placeholder="Enter Pickup Location"
              required
              autoComplete="off"
            />
            <button
              className="location-btn"
              onClick={handleUseCurrentLocation}
              style={{ marginBottom: "1rem" }}
            >
              Use My Current Location
            </button>

            {navigating && (
              <div className="request-overlay">
                <div className="request-spinner" aria-label="Navigating to booking page"></div>
                <p>Redirecting to nearby hospitals page...</p>
              </div>
            )}

            <button className="book-btn" onClick={fetchNearbyHospitals} type="submit">
              See Nearby Hospitals
            </button>
          </div>
        </div>
      </div>

      <div className="request-home-icon-below">
        <a href="/" className="request-home-icon">
          <i className="fa fa-home"></i>
          <span className="request-tooltip-text">Home</span>
        </a>
      </div>
    </div>
  );
}

export default RequestAmbulance;
