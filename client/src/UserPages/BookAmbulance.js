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
  const hospital = state?.hospital;
  const pickupLocation = state?.pickupLocation;
  const destinationLocation = state?.destAddress;
  const distance = hospital.distance;

  // pickupLocation is address string, so geocode it to lat/lng for marker
  const [pickupCoords, setPickupCoords] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [ambulanceType, setAmbulanceType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [partnerId, setPartnerId] = useState(null);
  // For booking form inputs
  const [formData, setFormData] = useState({ vehicleType: "" });
  const [errors, setErrors] = useState({ vehicleType: "" });
  const [ambulanceOptions, setAmbulanceOptions] = useState([]);
  const [ambulanceCost, setAmbulanceCost] = useState(0);
  const [noOfAmbulances, setNoOfAmbulances] = useState(1);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "vehicleType") {
      const selectedOption = ambulanceOptions.find((option) => option.type === value);
      setAmbulanceCost(selectedOption?.price || 0); // set cost
      setAmbulanceType(value);
    }
    else {
      setErrors((prev) => ({ ...prev, vehicleType: "" }));
    }
  };

  useEffect(() => {
    const fetchAmbulanceTypes = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/ambulance-types");
        const data = await res.json();

        if (res.ok) {
          setAmbulanceOptions(data);
        } else {
          console.error("Error fetching ambulance types:", data.message);
        }
      } catch (err) {
        console.error("Error fetching ambulance types:", err);
      }
    };

    fetchAmbulanceTypes();
  }, []);

  // Fetch partnerId from backend when hospital changes
  useEffect(() => {
    if (!hospital) {
      console.warn("No hospital data available");
      return;
    }
    const fetchPartnerId = async () => {
      try {
        if (!hospital) {
          console.warn("No hospital data available");
          return;
        }

        const response = await fetch(`http://localhost:3001/api/partners/by-hospital/${hospital.place_id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch partner data");
        }

        if (data.partnerId) {
          setPartnerId(data.partnerId);
          // localStorage.setItem("partnerId", data.partnerId);
        } else {
          console.warn("Partner ID not found in response");
        }
      } catch (error) {
        console.error("Error fetching partner data:", error);
      }
    };

    fetchPartnerId();
  }, [hospital]);

  // Show form on Book Ambulance button click
  const handleBookAmbulance = () => {
    setShowBookingForm(true);
  };

  // Handle confirm ambulance booking button
  const handleConfirmBooking = async () => {
    if (!ambulanceType || !urgency) {
      alert("Please select ambulance type and urgency.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");

      if (!partnerId) {
        alert("Invalid partner/hospital data");
        return;
      }

      const response = await fetch("http://localhost:3001/api/partners/confirm-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partnerId,
          userId,
          userName,
          pickup: pickupLocation,
          drop: destinationLocation,
          urgency,
          ambulanceType,
          numberOfAmbulancesRequested: noOfAmbulances,
          numberOfRemainingAmbulances: noOfAmbulances,
          ambulanceCost: (ambulanceCost + Number(hospital.cost.replace("₹", "").trim())) * noOfAmbulances,
          distance: distance,
        }),
      });

      const data = await response.json();
      console.log("DATA after calling confirm-request api: ", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to confirm request");
      }

      setShowBookingForm(false);
      alert("Request sent successfully!");

      setTimeout(() => {
        const { request } = data;

        navigate("/looking-for-driver", {
          state: {
            hospital: {
              ...hospital,
              _id: partnerId
            },
            data,
            pickupLocation: request.pickup,
            destAddress: request.drop,
            ambulanceType: request.ambulanceType,
            urgency: request.urgency,
            status: data.request.status,
            bookingId: data.request.bookingId,
            ambulanceTypeCost: ambulanceCost * noOfAmbulances,
            cost: Number(hospital.cost.replace("₹", "").trim()),
            distance: hospital.distance,
            nearbyHospitals: data.nearbyHospitals || [],
          },
        });
      }, 1000);

    } catch (error) {
      alert("Error confirming request: " + error.message);
    }
  };

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

  useEffect(() => {
    if (pickupLocation) geocodePickup();
  }, [pickupLocation, geocodePickup]);

  useEffect(() => {
    if (destinationLocation) geocodeDestination();
  }, [destinationLocation, geocodeDestination]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const handlePaymentMethod = async (amount) => {
    setShowPaymentMethod(true);

  }

  if (loadError) return <div>Error loading map</div>;
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
        <p className="hospital-name">Hospital: {hospital.name}</p>
        <div className="info">
          <p className="location-info">
            <span className="icon-text">
              <img src={pickupIcon} alt="Pickup" className="pickup-location-icon" />
              <strong>Pickup:</strong> {pickupLocation}
            </span>
          </p>

          {hospital ? (
            <>
              <p className="location-info">
                <span className="icon-text">
                  <img src={dropOffIcon} alt="Destination" className="dropOff-location-icon" />
                  <strong>Destination:</strong> {destinationLocation}
                </span>
              </p>
              <p className="info-item">
                <strong>Distance:</strong> {`${hospital.distance}`}
              </p>
              <p className="info-item">
                <strong>Duration:</strong> {hospital.duration}
              </p>
              <p className="info-item">
                <strong>Estimated Cost:</strong> {hospital.cost}
              </p>
              <p className="info-item">
                <strong>Rating:</strong> {hospital.rating || "Not Available"}⭐️
              </p>
            </>
          ) : (
            <p>No hospital selected.</p>
          )}
        </div>
        <button className="payment-method-btn" onClick={() => handlePaymentMethod(hospital.cost)}>Add Payment Method</button>
        <button className="book-ambulance-btn" onClick={handleBookAmbulance}>Book Ambulance</button>

        {/* Ambulance Booking Form Modal */}
        {showBookingForm && (
          <div className="booking-ambulance-popup">
            <div className="booking-ambulance-popup-content">

              <h3>Book Ambulance</h3>
              <div className="form-group">
                <label>
                  Number of Patients:
                  <select
                    value={noOfAmbulances > 1 ? "more" : "one"}
                    onChange={(e) => setNoOfAmbulances(e.target.value === "more" ? 2 : 1)}
                  >
                    <option value="one">One</option>
                    <option value="more">More than one</option>
                  </select>
                </label>

                <label className="form-label" htmlFor="vehicleType">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  {ambulanceOptions.map((option, index) => (
                    <option key={index} value={option.type} >
                      {option.type} - ₹{option.price}
                    </option>
                  ))}
                </select>
                {errors.vehicleType && (
                  <span className="error">{errors.vehicleType}</span>
                )}

              </div>

              <label>
                Urgency:
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  required
                ><option value="">Select Emergency Level</option>
                  <option value="Normal - Stable condition">Normal – Stable condition</option>
                  <option value="Priority - Needs quicker assistance">Priority – Needs quicker assistance</option>
                  <option value="Emergency - Life-threatening, immediate action required">Emergency – Life-threatening, immediate action required</option>

                </select>
              </label>

              <div className="form-group">
                <label htmlFor="noOfAmbulances">Number of Ambulances</label>
                <input
                  type="number"
                  id="noOfAmbulances"
                  min="1"
                  value={noOfAmbulances}
                  onChange={(e) => setNoOfAmbulances(Number(e.target.value))}
                  required
                  disabled={noOfAmbulances === 1}
                  className={noOfAmbulances === 1 ? "ambulance-disabled" : "no-of-ambulances"}
                />
              </div>

              <div className="confirm-booking">
                <button
                  className="confirm-ambulance-btn"
                  onClick={handleConfirmBooking}
                >
                  Confirm Booking
                </button>

                <button
                  className="book-cancel-btn"
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

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
    </div>
  );
}

export default BookAmbulance;
