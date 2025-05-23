import React, { useRef, useEffect, useState } from "react";
import "../styles/RequestAmbulance.css";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";

function RequestAmbulance() {
  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  const [urgency, setUrgency] = useState("");
  const directionsRendererRef = useRef(null);
  const directionsServiceRef = useRef(null);

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [amount, setAmount] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const loadGoogleMapsScript = (callback) => {
    if (window.google && window.google.maps) {
      callback();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.body.appendChild(script);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      if (!prev) document.body.classList.add("menu-open");
      else document.body.classList.remove("menu-open");
      return !prev;
    });
  };

  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (window.google && pickupRef.current && dropRef.current) {
        new window.google.maps.places.Autocomplete(pickupRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
        });

        new window.google.maps.places.Autocomplete(dropRef.current, {
          types: ["establishment"],
          componentRestrictions: { country: "in" },
        });

        const initialMap = new window.google.maps.Map(
          document.getElementById("map"),
          {
            center: { lat: 20.5937, lng: 78.9629 },
            zoom: 5,
          }
        );

        directionsServiceRef.current =
          new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: initialMap,
          suppressMarkers: false,
        });
      }
    });

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const pickup = pickupRef.current.value.trim();
    const drop = dropRef.current.value.trim();

    if (!pickup || !drop) {
      alert("Please enter both pickup and drop locations.");
      return;
    }

    setPickupLocation(pickup);
    setDropLocation(drop);

    if (!directionsServiceRef.current || !directionsRendererRef.current) {
      alert("Google Maps API not loaded yet.");
      return;
    }

    directionsServiceRef.current.route(
      {
        origin: pickup,
        destination: drop,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(result);

          const route = result.routes[0];
          if (route && route.legs.length > 0) {
            const leg = route.legs[0];
            setDistance(leg.distance.text);
            setDuration(leg.duration.text);

            const km = parseFloat(leg.distance.text.replace("km", "").trim());
            if (!isNaN(km)) {
              const fare = Math.ceil(km * 45);
              setAmount(`₹${fare}`);
            } else {
              setAmount("N/A");
            }
          }

          alert(`Routes found: ${result.routes.length}. Showing on map.`);
        } else {
          setDistance("");
          setDuration("");
          setAmount("");
          alert("Could not find routes: " + status);
        }
      }
    );
  };

  const buildNavigationLink = () => {
    const encodedPickup = encodeURIComponent(pickupLocation);
    const encodedDrop = encodeURIComponent(dropLocation);
    return `https://www.google.com/maps/dir/?api=1&origin=${encodedPickup}&destination=${encodedDrop}&travelmode=driving`;
  };

  return (
    <div className="request-layout">
      <div className="fixed-navbar-container">
        <nav className="request-navbar" role="navigation" aria-label="Main Navigation">
          <div className="request-navbar-content">
            <div className="request-navbar-logo">
              <h2>Life+</h2>
            </div>
            <div className={`request-navbar-links ${menuOpen ? "open" : ""}`}>
              <Link className="request-nav-link" to="/track-ambulance">Track Ambulance</Link>
              <Link className="request-nav-link" to="/SignIn">Login</Link>
            </div>
            <button
              className="request-menu-toggle"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <span className="request-close-icon">&times;</span>
              ) : (
                <GiHamburgerMenu size={28} color="#2563eb" />
              )}
            </button>
          </div>
        </nav>
      </div>

      <div className="content-container">
        <div className="map-section">
          <div id="map" style={{ height: "100vh", width: "100%" }} aria-label="Map showing routes"></div>
        </div>

        <div className="form-section">
          <div className="form-box">
            <h2>Book Your Emergency Ride🚑</h2>
            <form onSubmit={handleSubmit} aria-label="Request Ambulance Form">
              <input
                type="text"
                placeholder="Pickup Location"
                ref={pickupRef}
                required
                aria-label="Pickup Location"
                autoComplete="off"
              />
              <input
                type="text"
                placeholder="Drop-off (Hospital)"
                ref={dropRef}
                required
                aria-label="Drop-off Location"
                autoComplete="off"
              />
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                required
                aria-label="Select Urgency"
              >
                <option value="" disabled>Select Urgency</option>
                <option value="non-urgent">Non-Urgent</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
              <button type="submit" className="book-btn">Submit</button>
            </form>

            {(distance || duration || amount) && (
              <div className="distance-info">
                {distance && <p><strong>Distance:</strong> {distance}</p>}
                {duration && <p><strong>Estimated Time:</strong> {duration}</p>}
                {amount && <p><strong>Estimated Amount:</strong> {amount}</p>}
                <a
                  href={buildNavigationLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navigation-link"
                >
                  Start
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="request-home-icon-below">
          <a href="/" className="request-home-icon" aria-label="Go to Home Page" title="Home">
            <i className="fa fa-home" aria-hidden="true"></i>
            <span className="tooltip-text">Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default RequestAmbulance;
