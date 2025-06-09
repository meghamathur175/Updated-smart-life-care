import React, { useEffect, useState, useRef } from "react";
import GoogleMapReact from "google-map-react";
import "../styles/TrackAmbulance.css";

const AmbulanceMarker = () => (
  <div className="ambulance-marker" title="Ambulance Location">🚑</div>
);

const TrackAmbulancePage = () => {
  const [ambulanceCoords, setAmbulanceCoords] = useState({
    lat: 28.6139,
    lng: 77.2090,
  });

  const mapRef = useRef(null);
  const intervalRef = useRef(null);

  // Simulate movement by shifting lat/lng a bit every 2 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setAmbulanceCoords((prevCoords) => ({
        lat: prevCoords.lat + 0.0003,
        lng: prevCoords.lng + 0.0004,
      }));
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const defaultProps = {
    center: ambulanceCoords,
    zoom: 15,
  };

  return (
    <div className="track-container">
      <h2 className="heading">Ambulance is on the way!</h2>

      <div className="map-container">
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
          center={ambulanceCoords}
          zoom={defaultProps.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map }) => {
            mapRef.current = map;
          }}
        >
          <AmbulanceMarker lat={ambulanceCoords.lat} lng={ambulanceCoords.lng} />
        </GoogleMapReact>
      </div>

      <div className="details">
        <h3>Driver Details</h3>
        <p><strong>Name:</strong> Ramesh Kumar</p>
        <p><strong>Phone:</strong> +91 9876543210</p>
        <p><strong>Ambulance ID:</strong> AMB-1023</p>
        <p><strong>Estimated Arrival:</strong> 6 mins</p>
      </div>

      <div className="home-icon-below">
        <a href="/" className="home-icon">
          <i className="fa fa-home"></i>
          <span className="tooltip-text">Home</span>
        </a>
      </div>
    </div>
  );
};

export default TrackAmbulancePage;
