import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Tracking() {
  return (
    <div>
      <h2>Ambulance Live Tracking</h2>
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={12}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[28.6139, 77.209]}>
          <Popup>Ambulance Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Tracking;
