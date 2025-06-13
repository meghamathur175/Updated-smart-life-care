import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Request.css";

function Request() {
  const [requests, setRequests] = useState([]);
  const [partnerName, setPartnerName] = useState("");

  const partnerId = localStorage.getItem("partnerId");

  useEffect(() => {
    if (!partnerId) return;
    let intervalId;

    // Fetch pendingRequests for the given partner
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        // console.log("Token sending: ", token);
        const res = await axios.get(`http://localhost:3001/api/partners/partner-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // console.log("Requests fetched: ", res.data);
        
        setPartnerName(localStorage.getItem("partnerName"));
        // console.log("res data", res.data);
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching requests:", error.message);
      }
    };

    setTimeout(fetchRequests, 0);
    intervalId = setInterval(fetchRequests, 10000);
    return () => clearInterval(intervalId);
  }, [partnerId]);

  const updateStatus = async (index, newStatus) => {
    const updatedRequests = [...requests];
    updatedRequests[index].status = newStatus;
    setRequests(updatedRequests);

    try {
      await axios.post(
        `http://localhost:3001/api/partners/update-request-status`.trim(),
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
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, index) => (
            <tr key={req._id}>
              <td>{index + 1}</td>
              <td>{req.userName}</td>
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
                  disabled={req.status.toLowerCase() !== "requested"}
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
              <td>{new Date(req.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Request;
