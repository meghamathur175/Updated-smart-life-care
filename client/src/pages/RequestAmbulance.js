import React, { useRef, useEffect, useState } from "react";
import "../styles/RequestAmbulance.css";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";

function RequestAmbulance() {
  const pickupRef = useRef(null);
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [urgency, setUrgency] = useState("");
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

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
    loadGoogleMapsScript(() => {
      if (pickupRef.current) {
        new window.google.maps.places.Autocomplete(pickupRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
        });
      }

      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
      });

      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
      });
    });
    return () => document.body.classList.remove("menu-open");
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      document.body.classList.toggle("menu-open", !prev);
      return !prev;
    });
  };

  const fetchNearbyHospitals = () => {
    const address = pickupRef.current.value.trim();
    if (!address) {
      alert("Please enter a pickup location.");
      return;
    }

    if (!urgency) {
      alert("Please select an urgency level.");
      return;
    }

    setNavigating(true);
    setTimeout(() => {
      navigate("/nearby-hospitals", {
        state: {
          pickup: address,
          urgency
        },
      });
    }, 1000);

  };

  return (
    <div className="request-layout">
      <nav className="request-navbar">
        <div className="request-navbar-content">
          <div className="request-navbar-logo">
            <h2>Life+</h2>
          </div>
          <div className={`request-navbar-links ${menuOpen ? "request-open" : ""}`}>
            <Link to="/track-ambulance" className="request-nav-link">Track Ambulance</Link>
            <Link to="/signin" className="request-nav-link">Login</Link>
          </div>
          <button className="request-menu-toggle" onClick={toggleMenu}>
            {menuOpen ? <span className="home-close-icon">&times;</span> : <GiHamburgerMenu size={28} color="#2563eb" />}
          </button>
        </div>
      </nav>

      <div className="content-container">
        <div className="map-section">
          <div id="map" style={{ height: "100vh", width: "100%" }}></div>
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
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="urgency-select"
              aria-label="Select urgency level"
              required
            >
              <option value="" disabled hidden>
                Select Urgency
              </option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>

            {navigating && (
              <div className="request-overlay">
                <div className="request-spinner" aria-label="Navigating to booking page"></div>
                <p>Redirecting to nearby hospitals page...</p>
              </div>
            )}

            <button className="book-btn" onClick={fetchNearbyHospitals} type="submit" >
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
