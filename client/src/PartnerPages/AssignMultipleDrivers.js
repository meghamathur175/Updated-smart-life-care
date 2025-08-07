import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AssignMultipleDrivers.css";

function AssignMultipleDrivers() {
    const location = useLocation();
    const navigate = useNavigate();
    const { requestId, requestData, partnerId, } = location.state || {};
    const numberOfAmbulancesRequested = requestData?.numberOfAmbulancesRequested || 1;
    const remainingAmbulances = requestData?.remainingAmbulances;
    const [drivers, setDrivers] = useState([]);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const assignedByThisPartner = requestData?.assignedAmbulances?.filter(
        amb => amb.partnerId?.toString() === partnerId
    ) || [];

    const alreadyAssignedByThis = assignedByThisPartner.length;
    const remainingToAssign = numberOfAmbulancesRequested - alreadyAssignedByThis;

    useEffect(() => {
        if (!partnerId || !requestData?.ambulanceType) {
            alert("Missing booking details. Redirecting back.");
            navigate("/partner-dashboard/requests");
            return;
        }
        fetchFilteredDrivers(requestData.ambulanceType);
    }, [partnerId, requestData]);

    const fetchFilteredDrivers = async (ambulanceType) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/partner-drivers/by-partner`, {
                params: { partnerId }
            });

            setLoading(false);
            const available = res.data.drivers.filter(
                (d) => d.available && d.vehicleType === ambulanceType
            );

            setDrivers(available);
        } catch (err) {
            console.error('Error fetching drivers:', err);
        }
    };

    const handleDriverToggle = (driver) => {
        const isSelected = selectedDrivers.find((d) => d.driverId === driver._id);

        if (isSelected) {
            setSelectedDrivers((prev) => prev.filter((d) => d.driverId !== driver._id));
        } else {
            const isAlreadySelected = selectedDrivers.some((d) => d.driverId === driver._id);
            const nextCount = isAlreadySelected
                ? selectedDrivers.length - 1
                : selectedDrivers.length + 1;

            if (nextCount + alreadyAssignedByThis > numberOfAmbulancesRequested) {
                alert(`You can assign only ${remainingToAssign} more ambulances.`);
                return;
            }

            setSelectedDrivers((prev) => [
                ...prev,
                {
                    driverId: driver._id,
                    plateNumber: driver.ambulancePlateNumber,
                    driverType: "PartnerDriver",
                },
            ]);
        }
    };

    const handleSubmit = async () => {
        if (selectedDrivers.length === 0) return alert("Please select at least one ambulance.");
        setSubmitting(true);

        try {
            await axios.post("http://localhost:3001/api/partner-drivers/assign-multiple-ambulances", {
                bookingId: requestId,
                partnerId,
                ambulances: selectedDrivers,
            });

            const assignedCount = selectedDrivers.length;
            const totalAssigned = alreadyAssignedByThis + assignedCount;
            const remaining = numberOfAmbulancesRequested - totalAssigned;

            alert(`✅ ${assignedCount} assigned successfully. ${remaining > 0 ? `${remaining} still need to be assigned.` : 'All ambulances assigned!'}`);
            console.log(`✅ ${assignedCount} assigned successfully. ${remaining > 0 ? numberOfAmbulancesRequested - assignedCount : 0}`)

            navigate("/partner-dashboard/requests");
        } catch (err) {
            console.error("❌ Failed to assign ambulances:", err.message);
            alert(err?.response?.data?.message || "Failed to assign ambulances.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="assign-driver-container">
            <h2>Assign Ambulances</h2>

            <div className="request-summary">
                <p><strong>Patient:</strong> {requestData?.userName}</p>
                <p><strong>Pickup:</strong> {requestData?.pickup}</p>
                <p><strong>Required Type:</strong> {requestData?.ambulanceType}</p>
                <p><strong>Urgency:</strong> {requestData?.urgency}</p>
                <p>Available ambulances of required type: <b>{drivers.length}</b></p>
                <p> Requested No. of ambulances: <b>{numberOfAmbulancesRequested}</b></p>
                <p>Currently selected: <b>{selectedDrivers.length}</b></p>
            </div>

            {loading ? (
                <p>Loading drivers...</p>
            ) : drivers.length === 0 ? (
                <p>No available ambulances match the required type: <b>{requestData?.ambulanceType}</b></p>
            ) : (
                <div className="drivers-list">
                    {drivers.map((driver) => {
                        const isSelected = selectedDrivers.find((d) => d.driverId === driver._id);
                        return (
                            <div
                                key={driver._id}
                                className={`driver-card ${isSelected ? "selected" : ""}`}
                                onClick={() => handleDriverToggle(driver)}
                            >
                                <p><strong>{driver.name}</strong></p>
                                <p>Ambulance No: {driver.ambulancePlateNumber}</p>
                                <p>Phone: {driver.phone}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            <button
                className="btn assign-final"
                onClick={handleSubmit}
                disabled={submitting || selectedDrivers.length === 0}
            >
                {submitting ? "Assigning..." : `Assign ${selectedDrivers.length} Ambulance(s)`}
            </button>
        </div>
    );
}

export default AssignMultipleDrivers;
