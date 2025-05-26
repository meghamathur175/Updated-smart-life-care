import React, { useState, useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import "../styles/NearbyHospitals.css";

const libraries = ["places"];

function NearbyHospitalsList() {
  const { state } = useLocation();
  const pickupLocation = state?.pickup || "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const containerRef = useRef(null); // dummy div ref for PlacesService

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  const searchByAddress = () => {
    if (!pickupLocation.trim()) {
      alert("Pickup location is not provided.");
      return;
    }

    if (!containerRef.current) {
      alert("Map container not ready yet, please wait.");
      return;
    }

    setLoading(true);
    setSearchInitiated(true);

    //  Geocoder to convert pickup address to latitude/longitude
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: pickupLocation }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;

        const request = {
          location,
          radius: 5000,
          type: "hospital",
        };

        const service = new window.google.maps.places.PlacesService(containerRef.current);
        service.nearbySearch(request, async (results, status) => {
          setLoading(false);
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results?.length
          ) {
            const directionsService = new window.google.maps.DirectionsService();

            const enrichedHospitals = await Promise.all(
              results.map(
                (hospital) =>
                  new Promise((resolve) => {
                    directionsService.route(
                      {
                        origin: location,
                        destination: hospital.geometry.location,
                        travelMode: "DRIVING",
                      },
                      (result, status) => {
                        if (status === "OK" && result?.routes?.[0]?.legs?.[0]) {
                          const leg = result.routes[0].legs[0];
                          const km = parseFloat(
                            leg.distance.text
                              .replace(/,/g, "")
                              .replace("km", "")
                              .trim()
                          );
                          resolve({
                            ...hospital,
                            distance: leg.distance.text,
                            duration: leg.duration.text,
                            cost: isNaN(km) ? "N/A" : `₹${Math.ceil(km * 45)}`,
                          });
                        } else {
                          console.error("Directions error:", status);
                          resolve({
                            ...hospital,
                            distance: "N/A",
                            duration: "N/A",
                            cost: "N/A",
                          });
                        }
                      }
                    );
                  })
              )
            );

            setHospitals(enrichedHospitals);
          } else {
            setHospitals([]);
            alert("No hospitals found nearby.");
          }
        });
      } else {
        setLoading(false);
        setHospitals([]);
        alert("Pickup location not found. Please check the location.");
      }
    });
  };

  useEffect(() => {
    if (pickupLocation && isLoaded && !searchInitiated) {
      searchByAddress();
    }
  }, [pickupLocation, isLoaded, searchInitiated]);

  if (loadError)
    return (
      <div className="hospitals-container">
        <h2>Error loading Google Maps API</h2>
      </div>
    );

  return (
    <div className="hospitals-container">
      <h2>Nearby Hospitals</h2>
      <p>
        <strong>Pickup Location:</strong> {pickupLocation || "Not provided"}
      </p>

      {/* Dummy container for PlacesService */}
      <div ref={containerRef} style={{ display: "none" }}></div>

      <div>
        {loading && <div className="spinner" aria-label="Loading spinner"></div>}

        {!loading && hospitals.length > 0 && (
          <ul className="hospital-list">
            {hospitals.map((hospital) => (
              <li key={hospital.place_id} className="hospital-card">
                <h3>{hospital.name}</h3>
                <div className="hospital-details">
                  <p className="hospital-detail">
                    <span className="label">Address:</span>
                    <span
                      className="value"
                      title={hospital.vicinity || "Not Available"}
                    >
                      {hospital.vicinity || "Not Available"}
                    </span>
                  </p>
                  <p className="hospital-detail">
                    <span className="label">Distance:</span>
                    <span className="value">{hospital.distance}</span>
                  </p>
                  <p className="hospital-detail">
                    <span className="label">Time:</span>
                    <span className="value">{hospital.duration}</span>
                  </p>
                  <p className="hospital-detail">
                    <span className="label">Cost:</span>
                    <span className="value">{hospital.cost}</span>
                  </p>
                  <p className="hospital-detail">
                    <span className="label">Rating:</span>
                    <span className="value">{hospital.rating || "Not Available"}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && searchInitiated && hospitals.length === 0 && (
          <p>No hospitals found. Try a different location.</p>
        )}
      </div>
    </div>
  );
}

export default NearbyHospitalsList;
