import React from "react";
// import GoogleMapReact from "google-map-react";
import "../styles/TrackAmbulance.css";

// const AmbulanceMarker = () => (
//   <div className="ambulance-marker">🚑</div>
// );

const TrackAmbulancePage = () => {
  // const defaultProps = {
  //   center: {
  //     lat: 28.6139, // default to Delhi or any location
  //     lng: 77.2090,
  //   },
  //   zoom: 14,
  // };

  return (
    <div className="track-container">
      <h2 className="heading">Ambulance is on the way!</h2>

      <div className="map-container">
        {/* <GoogleMapReact
          bootstrapURLKeys={{ key: import.meta.env.VITE_MAPS_API_KEY }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
        >
          <AmbulanceMarker lat={28.6139} lng={77.2090} />
        </GoogleMapReact> */}
      </div>

      <div className="details">
        <h3>Driver Details</h3>
        <p><strong>Name:</strong> Ramesh Kumar</p>
        <p><strong>Phone:</strong> +91 9876543210</p>
        <p><strong>Ambulance ID:</strong> AMB-1023</p>
        <p><strong>Estimated Arrival:</strong> 8 mins</p>
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
