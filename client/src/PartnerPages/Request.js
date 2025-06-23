import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Request.css";

function Request() {
  const [requests, setRequests] = useState([]);
  const [partnerName, setPartnerName] = useState("");
  const navigate = useNavigate();

  const partnerId = localStorage.getItem("partnerId");

  useEffect(() => {
    if (!partnerId) return;
    let intervalId;

    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        const res = await axios.get(
          `http://localhost:3001/api/partners/partner-requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Requests fetched: ", res.data);
        setPartnerName(localStorage.getItem("partnerName") || "Partner");
        setRequests(res.data || []);

      } catch (error) {
        console.error("Error fetching requests:", error.message);
      }
    };

    fetchRequests();
    intervalId = setInterval(fetchRequests, 10000);
    return () => clearInterval(intervalId);
  }, [partnerId]);

  const updateStatus = async (index, newStatus) => {
    const updatedRequests = [...requests];
    updatedRequests[index].status = newStatus;
    setRequests(updatedRequests);

    const requestId = requests[index]._id;

    if (newStatus === "Rejected & Reassigned") {
      try {
        const res = await axios.post("http://localhost:3001/api/partners/reject-and-transfer", {
          partnerId,
          bookingId: requests[index].bookingId,
          pickup: requests[index].pickup,
        });
        console.log("Res in updateStatus of Request: ", res.data);
        alert(`✅ Rejected and transferred to: ${res.data.reassignedTo?.name || "Unknown"}`);
      } catch (err) {
        console.error("❌ Rejection failed:", err);
        alert("❌ Failed to transfer request to nearby hospital.");
      }
    } else {
      try {
        await axios.post("http://localhost:3001/api/partners/update-request-status", {
          partnerId,
          requestId,
          newStatus,
        });
      } catch (err) {
        console.error("Failed to update request status:", err);
      }
    }
  };

  const handleAssignDriver = (request) => {
    navigate("/partner-dashboard/assign-driver", {
      state: {
        requestId: request.bookingId,
        requestData: request,
        partnerId,
      },
    });
  };

  return (
    <div className="request-table-container">
      <h2>{partnerName}</h2>
      <h2>🚑 Ambulance Requests</h2>
      {requests.length === 0 ? (
        <div className="no-requests-message">
          No requests found for this partner.
        </div>
      ) : (
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
                <td>{req.userName}</td>
                <td>{req.pickup}</td>
                <td>{req.ambulanceType}</td>
                <td>{req.urgency}</td>
                <td>
                  <span className={`status ${req.status?.toLowerCase()}`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  <div className="partner-request-actions-btn">
                    <button
                      className="btn accept"
                      onClick={() => updateStatus(index, "Accepted")}
                      disabled={
                        !["requested", "reassigned"].includes(req.status?.toLowerCase())
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="btn reject"
                      onClick={() => updateStatus(index, "Rejected & Reassigned")}
                      disabled={
                        !["requested", "reassigned"].includes(req.status?.toLowerCase())
                      }
                    >
                      Reject
                    </button>

                    {req.status?.toLowerCase() === "accepted" && (
                      <button
                        className="btn assign"
                        onClick={() => handleAssignDriver(req)}
                      >
                        Assign Driver
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Request;
