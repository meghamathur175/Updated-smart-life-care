import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Request.css";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

function Request() {
  const [requests, setRequests] = useState([]);
  const [partnerName, setPartnerName] = useState("");
  const [timers, setTimers] = useState({});
  const [acceptedTimes, setAcceptedTimes] = useState({});
  const [rejectedTimes, setRejectedTimes] = useState({});
  const navigate = useNavigate();

  const partnerId = localStorage.getItem("partnerId");

  useEffect(() => {
    if (!partnerId) return;
    let intervalId;

    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        const res = await axios.get(`http://localhost:3001/api/partners/partner-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const freshRequests = res.data || [];
        setPartnerName(localStorage.getItem("partnerName") || "Partner");
        setRequests(freshRequests);

        const newTimers = { ...timers };

        freshRequests.forEach((req) => {
          const bookingId = req.bookingId;
          const status = req.status?.toLowerCase();

          if (["requested", "reassigned"].includes(status) && !timers.hasOwnProperty(bookingId)) {
            const urgency = req.urgency;
            const urgencyDuration = urgency === "Emergency - Life-threatening, immediate action required" ? 30 : urgency === "Priority - Needs quicker assistance" ? 60 : 120;

            newTimers[bookingId] = {
              isRunning: true,
              startTime: new Date(req.timestamp).getTime(),
              urgencyDuration,
            };
          }
        });

        setTimers(newTimers); // Set only once after the loop

      } catch (error) {
        console.error("Error fetching requests:", error.message);
      }
    };

    fetchRequests();
    intervalId = setInterval(fetchRequests, 1000);
    return () => clearInterval(intervalId);
  }, [partnerId, timers]);

  const handleAssignDriver = (request) => {
    navigate("/partner-dashboard/assign-driver", {
      state: {
        requestId: request.bookingId,
        requestData: request,
        partnerId,
      },
    });
  };

  const updateStatus = async (index, newStatus) => {
    const bookingId = requests[index].bookingId;
    const requestId = requests[index]._id;
    const updatedRequests = [...requests];
    console.log("Updated req: ", updatedRequests);
    const requestData = requests[index];
    console.log("Req DATA: ", requestData);

    const timerInfo = timers[bookingId];
    const elapsedSec = timerInfo?.startTime
      ? Math.floor((Date.now() - timerInfo.startTime) / 1000)
      : 0;

    try {
      if (newStatus === "Rejected & Reassigned") {
        // Keep record of rejection time
        setRejectedTimes((prev) => ({ ...prev, [bookingId]: elapsedSec }));

        // Send list of previously rejected partners to skip them
        const res = await axios.post("http://localhost:3001/api/partners/reject-and-transfer", {
          partnerId,
          bookingId,
          pickup: requestData.pickup,
          reassignedPartners: requestData.reassignedPartners || [],
        });

        // Update the local list of reassigned partners
        updatedRequests[index].reassignedPartners = [
          ...(requestData.reassignedPartners || []),
          partnerId,
        ];

        alert(`✅ Rejected and transferred to: ${res.data.reassignedTo?.name || "Unknown"}`);
      } else {
        await axios.post("http://localhost:3001/api/partners/update-request-status", {
          partnerId,
          requestId,
          newStatus,
        });

        if (newStatus === "Accepted") {
          setAcceptedTimes((prev) => ({ ...prev, [bookingId]: elapsedSec }));
        }
      }

      updatedRequests[index].status = newStatus;
      setRequests(updatedRequests);

      if (timerInfo?.startTime) {
        await axios.post("http://localhost:3001/api/partners/store-response-time", {
          partnerId,
          bookingId,
          responseTime: elapsedSec,
          action: newStatus,
        });

        setTimers((prev) => ({
          ...prev,
          [bookingId]: { ...prev[bookingId], isRunning: false },
        }));
      }

    } catch (err) {
      console.error("❌ Failed to update status:", err);
      alert("Failed to update request status. Please try again.");
    }
  };

  return (
    <div className="request-table-container">
      <h2>{partnerName}</h2>
      <h2>🚑 Ambulance Requests</h2>
      {requests.length === 0 ? (
        <div className="no-requests-message">No requests found for this partner.</div>
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
            {requests.map((req, index) => {
              const bookingId = req.bookingId;
              const status = req.status?.toLowerCase();
              return (
                <tr key={req._id}>
                  <td>{index + 1}</td>
                  <td>{req.userName}</td>
                  <td>{req.pickup}</td>
                  <td>{req.ambulanceType}</td>
                  <td>{req.urgency}</td>
                  <td>
                    <span className={`status ${status === "no action taken" ? "no-action" : status}`}>
                      {status === "no action taken" ? "⚠️ No Action Taken" : req.status}
                    </span>

                    {req.rejectedByPartnerName && (
                      <div className="rejected-by">
                        🏥 Rejected by: <strong>{req.rejectedByPartnerName}</strong>
                      </div>
                    )}

                    {(req.status === "assigned" || req.status === "reassigned" || req.status === "requested") && timers[bookingId]?.isRunning && (() => {
                      const { urgencyDuration, startTime } = timers[bookingId];
                      const elapsed = Math.floor((Date.now() - startTime) / 1000);
                      const remaining = Math.max(urgencyDuration - elapsed, 0);

                      return remaining > 0 && (
                        <CountdownCircleTimer
                          key={bookingId + "-" + remaining}
                          isPlaying
                          duration={remaining}
                          colors={["#00ff00", "#ff7d29", "#ff0000", "#ff0000"]}
                          colorsTime={[
                            urgencyDuration,
                            urgencyDuration / 2,
                            urgencyDuration / 4,
                            0
                          ]}
                          strokeWidth={8}
                          size={60}
                          onComplete={() => {
                            const reqIndex = requests.findIndex(r => r.bookingId === bookingId);
                            const currentStatus = requests[reqIndex]?.status?.toLowerCase();

                            if (["requested", "reassigned"].includes(currentStatus)) {
                              updateStatus(reqIndex, "Rejected & Reassigned");
                            }

                            setTimers(prev => ({
                              ...prev,
                              [bookingId]: { ...prev[bookingId], isRunning: false },
                            }));

                            return [false, 0];
                          }}
                        >
                          {({ remainingTime }) => (
                            <div style={{ fontSize: "14px" }}>{remainingTime}s</div>
                          )}
                        </CountdownCircleTimer>
                      );
                    })()}

                    {acceptedTimes[bookingId] && (
                      <div className="accepted-time">✅ Accepted in {acceptedTimes[bookingId]}s</div>
                    )}
                    {rejectedTimes[bookingId] && (
                      <div className="rejected-time">❌ Rejected in {rejectedTimes[bookingId]}s</div>
                    )}
                  </td>
                  <td>
                    <div className="partner-request-actions-btn">
                      <button
                        className="btn accept"
                        onClick={() => updateStatus(index, "Accepted")}
                        disabled={!["requested", "reassigned"].includes(status)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn reject"
                        onClick={() => updateStatus(index, "Rejected & Reassigned")}
                        disabled={!["requested", "reassigned"].includes(status)}
                      >
                        Reject
                      </button>
                      {status === "accepted" && (
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
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Request;
