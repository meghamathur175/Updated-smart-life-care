import React, { useState, useEffect, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/NearbyHospitals.css";

const libraries = ["places"];

function NearbyHospitalsList() {
  const { state } = useLocation();
  const pickupLocation = state?.pickup || "";
  const navigate = useNavigate();

  const [navigating, setNavigating] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [error, setError] = useState(null);

  const containerRef = useRef(null); // dummy div ref for PlacesService

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Enrich hospital data with driving distance, duration and cost within 5km
  const enrichHospitals = useCallback(
    async (hospitalsList, originLocation) => {
      const directionsService = new window.google.maps.DirectionsService();

      const enrichedList = await Promise.all(
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
                  if (
                    status === "OK" &&
                    result?.routes?.[0]?.legs?.[0]
                  ) {
                    const leg = result.routes[0].legs[0];
                    const km = parseFloat(
                      leg.distance.text
                        .replace(/,/g, "")
                        .replace("km", "")
                        .trim()
                    );

                    if (km <= 5) {
                      resolve({
                        ...hospital,
                        distance: leg.distance.text,
                        duration: leg.duration.text,
                        cost: isNaN(km) ? "N/A" : `₹${Math.ceil(km * 45)}`,
                      });
                    } else {
                      // Exclude hospitals > 5km
                      resolve(null);
                    }
                  } else {
                    // If unable to get route info, resolve with defaults
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

      // Filter out nulls (hospitals > 5km)
      return enrichedList.filter((h) => h != null);
    },
    []
  );

  // Main function to search hospitals by pickup location address
  const searchByAddress = useCallback(() => {
    if (!pickupLocation.trim()) {
      setError("Pickup location is not provided.");
      return;
    }

    if (!containerRef.current) {
      setError("Map container not ready yet, please wait.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchInitiated(true);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: pickupLocation }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const request = {
          location,
          radius: 5000, // 5km
          type: "hospital",
        };

        const allHospitals = [];

        const fetchHospitals = (service, request, location) => {
          const processPage = (results, status, pagination) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results?.length
            ) {
              allHospitals.push(...results);

              if (pagination && pagination.hasNextPage) {
                setTimeout(() => pagination.nextPage(), 2000); // Respect rate limits
              } else {
                enrichHospitals(allHospitals, location)
                  .then((enriched) => {
                    if (enriched.length === 0) {
                      setError("No hospitals found within 5 km driving distance.");
                      setHospitals([]);
                    } else {
                      setHospitals(enriched);
                    }
                    setLoading(false);
                  })
                  .catch(() => {
                    setError("Failed to enrich hospital data.");
                    setLoading(false);
                  });
              }
            } else {
              setHospitals([]);
              setLoading(false);
              setError("No hospitals found nearby.");
            }
          };

          service.nearbySearch(request, processPage);
        };

        const service = new window.google.maps.places.PlacesService(
          containerRef.current
        );

        fetchHospitals(service, request, location);
      } else {
        setLoading(false);
        setHospitals([]);
        setError("Pickup location not found. Please check the location.");
      }
    });
  }, [pickupLocation, enrichHospitals]);

  // Navigate to book ambulance page with hospital details
  const navigateToBookAmbulancePage = (hospital) => {
    if (navigating) return; // prevent double clicks
    setNavigating(true);

    setTimeout(() => {
      const hospitalData = {
        _id: hospital._id, 
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

      navigate("/nearby-hospitals/book-ambulance", {
        state: {
          hospital: hospitalData,
          pickupLocation,
          destAddress: hospital.vicinity,
        },
      });
    }, 1000);
  };

  // Run search when component mounts or pickupLocation changes
  useEffect(() => {
    if (pickupLocation && isLoaded && !searchInitiated) {
      searchByAddress();
    }
  }, [pickupLocation, isLoaded, searchInitiated, searchByAddress]);

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

      {/* Hidden div for PlacesService initialization */}
      <div ref={containerRef} style={{ display: "none" }} />

      <div>
        {loading && (
          <p aria-live="polite" aria-busy="true">
            Loading nearby hospitals...
          </p>
        )}

        {error && !loading && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {!loading && hospitals.length > 0 && (
          <ul className="hospital-list">
            {hospitals.map((hospital) => (
              <li
                key={hospital.place_id}
                className={`hospital-card ${navigating ? "disabled" : ""}`}
                onClick={() => !navigating && navigateToBookAmbulancePage(hospital)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !navigating) {
                    navigateToBookAmbulancePage(hospital);
                  }
                }}
                aria-disabled={navigating}
              >
                <h3>{hospital.name}</h3>
                <div className="hospital-details">
                  <p className="hospital-detail">
                    <span className="label">Address:</span>{" "}
                    <span className="value" title={hospital.vicinity || "Not Available"}>
                      {hospital.vicinity || "Not Available"}
                    </span>
                  </p>
                  <p className="hospital-detail">
                    <span className="label">Distance:</span>{" "}
                    <span className="value">{hospital.distance}</span>
                  </p>
                  <p className="hospital-detail">
                    <span className="label">Time:</span>{" "}
                    <span className="value">{hospital.duration}</span>
                  </p>
                  <p className="hospital-detail">
                    <span className="label">Cost:</span>{" "}
                    <span className="value">{hospital.cost}</span>
                  </p>
                  <p className="hospital-detail">
                    <span className="label">Rating:</span>{" "}
                    <span className="value">{hospital.rating || "Not Available"}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && searchInitiated && hospitals.length === 0 && !error && (
          <p>No hospitals found. Try a different location.</p>
        )}

        {navigating && (
          <div className="overlay" role="alert" aria-live="assertive">
            <div className="spinner" aria-label="Navigating to booking page"></div>
            <p>Redirecting to booking page...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NearbyHospitalsList;
