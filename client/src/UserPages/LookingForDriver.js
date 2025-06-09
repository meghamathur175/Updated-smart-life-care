import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/LookingForDriver.css';

const LookingForDriver = () => {
    const { state } = useLocation();
    const hospital = state?.hospital;
    const pickupLocation = state?.pickupLocation;
    const destinationLocation = state?.destAddress;
    const ambulanceType = state?.ambulanceType;
    const navigate = useNavigate();

    const fare = {
        Basic: 100,
        Advanced: 100,
        ICU: 300,
    };

    const costString = hospital?.cost ? hospital.cost.replace("₹", "").trim() : "0";
    const cost = Number(costString) || 0;
    const baseFare = fare[ambulanceType] || 0;
    const price = baseFare + cost;

    const handleDriverDetails = () => {
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
                    lat: hospital.geometry.location.lat,
                    lng: hospital.geometry.location.lng,
                },
            },
        };

        const ride = {
            captain: {
                fullname: {
                    firstname: "Ravi"
                },
                vehicle: {
                    plate: "RJ14 XX 1234"
                }
            },
            otp: "4581",
            pickup: pickupLocation,
            destination: destinationLocation,
            fare: price,
        };

        navigate('/waiting-for-driver', {
            state: {
                ride,
                hospital: hospitalData,
                ambulanceType,
            },
        });

    };

    return (
        <div className="driver-popup">
            <h3 className="driver-title">Looking for a Driver</h3>
            <div className="looking-driver-content">
                <div className="looking-driver-details">
                    <div className="driver-detail-row">
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h4 className="detail-heading">{pickupLocation || "Unknown Location"}</h4>
                            <p className="detail-sub">Pickup Point</p>
                        </div>
                    </div>

                    <div className="driver-detail-row">
                        <i className="ri-map-pin-2-fill"></i>
                        <div>
                            <h4 className="detail-heading">{destinationLocation || "Unknown Destination"}</h4>
                            <p className="detail-sub">Destination</p>
                        </div>
                    </div>

                    <div className="driver-detail-row">
                        <i className="ri-currency-line"></i>
                        <div>
                            <h4 className="detail-heading">₹{price}</h4>
                            <p className="detail-sub">Cash</p>
                        </div>
                    </div>
                </div>

                <button className="driver-detail-button" onClick={handleDriverDetails}>
                    View Driver Details
                </button>
            </div>
        </div>
    );
};

export default LookingForDriver;
