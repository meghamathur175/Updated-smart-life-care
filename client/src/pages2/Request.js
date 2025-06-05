import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Request.css";

function Request() {
  const [requests, setRequests] = useState([]);
  const userName = localStorage.getItem("userName");
  const [partnerName, setPartnerName] = useState("");

  const partnerId = localStorage.getItem("partnerId");

  // Pawan Hospital
  // const partnerId = "683eb5c27c7f6b0bde898401";             

  // Solanki Hospital
  // const partnerId = "683d99bb70d68b47a4087f0b";             

  // Gangori Hospital
  // const partnerId = "683d88134b2fdbba37547582";             

  // Pandit Deen Dayal Upadhyaya Hospital
  // const partnerId = "683d8ba7e8deb31bf6371d12";   

  // Mahatma Gandhi Hospital
  // const partnerId = "683f09f7998ac68d4e6ff832";

  // Gangapole Hospital
  // const partnerId = "68401012b3eb1b9bfc64131f";

  useEffect(() => {
    if (!partnerId) return;
    let intervalId;

    // Fetch pendingRequests for the given partner
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/Partners/${partnerId}`
        );

        setPartnerName(res.data.name);
        setRequests(res.data.pendingRequests || res.data.data || []);
      } catch (error) {
        console.error("Error fetching requests:", error.message);
      }
    };

    fetchRequests();
    intervalId = setInterval(fetchRequests, 5000);
    return () => clearInterval(intervalId);
  }, [partnerId]);

  const updateStatus = async (index, newStatus) => {
    const updatedRequests = [...requests];
    updatedRequests[index].status = newStatus;
    setRequests(updatedRequests);

    try {
      await axios.post(
        `http://localhost:3001/api/Partners/update-request-status`,
        {
          partnerId,
          requestId: requests[index]._id,
          newStatus,
        }
      );
    } catch (err) {
      console.error("Failed to update request status:", err);
    }
  };

  return (
    <div className="request-table-container">
      <h2>{partnerName}</h2>
      <h2>🚑 Ambulance Requests</h2>
      {requests.length === 0 && (
        <div className="no-requests-message">No requests found for this partner.</div>
      )}
      <table className="request-table">
        <thead>
          <tr>
            <th>S. No.</th>
            <th>Patient Name</th>
            <th>Pickup</th>
            <th>Ambulance Type</th>
            <th>Urgency</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, index) => (
            <tr key={req._id}>
              <td>{index + 1}</td>
              <td>{userName}</td>
              <td>{req.pickup}</td>
              <td>{req.ambulanceType}</td>
              <td>{req.urgency}</td>
              <td>
                <span className={`status ${req.status.toLowerCase()}`}>
                  {req.status}
                </span>
              </td>
              <td>
                <button
                  className="btn accept" 
                  onClick={() => updateStatus(index, "Accepted")}
                  disabled={req.status !== "requested"}
                >
                  Accept
                </button>
                <button
                  className="btn reject"
                  onClick={() => updateStatus(index, "Rejected")}
                  disabled={req.status !== "requested"}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Request;
