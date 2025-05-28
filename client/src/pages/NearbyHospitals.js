import React, { useState, useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/NearbyHospitals.css";

const libraries = ["places"];

function NearbyHospitalsList() {
  const { state } = useLocation();
  const pickupLocation = state?.pickup || "";
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const containerRef = useRef(null); // dummy div ref for PlacesService

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  const enrichHospitals = async (hospitalsList, originLocation) => {
    const directionsService = new window.google.maps.DirectionsService();

    return Promise.all(
      hospitalsList.map(
        (hospital) =>
          new Promise((resolve) => {
            directionsService.route(
              {
                origin: originLocation,
                destination: hospital.geometry.location,
                travelMode: "DRIVING",
              },
              (result, status) => {
                if (status === "OK" && result?.routes?.[0]?.legs?.[0]) {
                  const leg = result.routes[0].legs[0];
                  const km = parseFloat(leg.distance.text.replace(/,/g, "").replace("km", "").trim());

                  if (km <= 5) {
                    resolve({
                      ...hospital,
                      distance: leg.distance.text,
                      duration: leg.duration.text,
                      cost: isNaN(km) ? "N/A" : `₹${Math.ceil(km * 45)}`,
                    });
                  } else {
                    resolve(null);
                  }
                } else {
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
    ).then((enriched) => enriched.filter((h) => h != null));
  };

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

        const allHospitals = [];

        const fetchHospitals = (service, request, location) => {
          const processPage = (results, status, pagination) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
              allHospitals.push(...results);

              if (pagination && pagination.hasNextPage) {
                setTimeout(() => pagination.nextPage(), 2000); // 2s delay to respect API rate limit
              } else {
                enrichHospitals(allHospitals, location).then((enriched) => {
                  setHospitals(enriched);
                  setLoading(false);
                });
              }
            } else {
              setHospitals([]);
              setLoading(false);
              alert("No hospitals found nearby.");
            }
          };

          service.nearbySearch(request, processPage);
        };

        const service = new window.google.maps.places.PlacesService(containerRef.current);
        fetchHospitals(service, request, location);


      } else {
        setLoading(false);
        setHospitals([]);
        alert("Pickup location not found. Please check the location.");
      }
    });
  };

  const navigateToBookAmbulancePage = (hospital) => {
    setNavigating(true);

    setTimeout(() => {
      const hospitalData = {
        place_id: hospital.place_id,
        name: hospital.name,
        vicinity: hospital.vicinity,
        distance: hospital.distance,
        duration: hospital.duration,
        cost: hospital.cost,
        rating: hospital.rating,
        geometry: {
          location: {
            lat: hospital.geometry.location.lat(),
            lng: hospital.geometry.location.lng(),
          },
        },
      };

      navigate('/nearby-hospitals/book-ambulance', {
        state: {
          hospital: hospitalData,
          pickupLocation,
          destAddress: hospital.vicinity,
        },
      });
    }, 1000);
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
        {navigating && (
          <div className="overlay">
            <div className="spinner" aria-label="Navigating to booking page"></div>
            <p>Redirecting to booking page...</p>
          </div>
        )}

        {!loading && hospitals.length > 0 && (
          <ul className="hospital-list">
            {hospitals.map((hospital) => (
              <li key={hospital.place_id} className="hospital-card" onClick={() => navigateToBookAmbulancePage(hospital)}>
                <h3>{hospital.name}</h3>
                <div className="hospital-details">
                  <p className="hospital-detail">
                    <span className="label">Address:</span>
                    <span className="value" title={hospital.vicinity || "Not Available"}
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
