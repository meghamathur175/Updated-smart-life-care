import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Request.css";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function Request() {
  const [requests, setRequests] = useState([]);
  const [partnerName, setPartnerName] = useState("");
  const [timers, setTimers] = useState({});
  const [AcceptedTimes, setAcceptedTimes] = useState({});
  const [rejectedTimes, setRejectedTimes] = useState({});
  const [dateFilter, setDateFilter] = useState(dayjs().format("YYYY-MM-DD"));
  const [statusFilter, setStatusFilter] = useState("Requested");
  const navigate = useNavigate();
  const partnerId = localStorage.getItem("partnerId");

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("partnerToken");
      const res = await axios.get("http://localhost:3001/api/partners/partner-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const freshRequests = res.data || [];
      setPartnerName(localStorage.getItem("partnerName") || "Partner");
      setRequests(freshRequests);

      const newTimers = { ...timers };

      freshRequests.forEach((req) => {
        const bookingId = req.bookingId;
        const status = req.status?.toLowerCase();

        // Only set timer for new requested bookings if not already set
        if (status === "requested" && !newTimers.hasOwnProperty(bookingId)) {
          const urgency = req.urgency;
          const urgencyDuration =
            urgency === "Emergency - Life-threatening, immediate action required"
              ? 30
              : urgency === "Priority - Needs quicker assistance"
                ? 60
                : 120;

          newTimers[bookingId] = {
            isRunning: true,
            startTime: new Date(req.timestamp).getTime(),
            urgencyDuration,
          };
        }
      });

      setTimers(newTimers);

    } catch (error) {
      console.error("Error fetching requests:", error.message);
    }
  };

  useEffect(() => {
    if (!partnerId) return;
    let intervalId;

    fetchRequests();
    intervalId = setInterval(fetchRequests, 1000);
    return () => clearInterval(intervalId);
  }, [partnerId]);

  const handleAssignDriver = (request) => {
    navigate("/partner-dashboard/assign-driver", {
      state: {
        requestId: request.bookingId,
        requestData: request,
        partnerId,
      },
    });
  };

  const getFilteredRequests = () => {
    // console.log("REQUESTS inside getFiltered: ", requests);

    const currentDateFiltered = requests.filter((req) => {
      const reqDate = req.localDate
        ? req.localDate
        : req.timestamp
          ? dayjs(req.timestamp).tz("Asia/Kolkata").format("YYYY-MM-DD")
          : "";
      return dateFilter ? reqDate === dateFilter : true;
    });

    if (!dateFilter || currentDateFiltered.length === 0) return [];

    return currentDateFiltered.filter((req) => {
      const status = req.status?.toLowerCase();
      const rejectionType = req.rejectionType?.toLowerCase();

      switch (statusFilter.toLowerCase()) {
        case "requested":
          return status === "requested" || status === "accepted";
        case "driver assigned":
          return ["assigned", "assigned_by_individual_driver"].includes(status);
        case "rejected":
          return status === "rejected" && rejectionType === "manual";
        case "auto rejected":
          return status === "rejected" && rejectionType === "auto";
        case "all requests":
        default:
          return true;
      }
    });
  };

  const filteredRequests = getFilteredRequests();
  // console.log("FILTERED req: ", filteredRequests);

  const updateStatus = async (bookingId, newStatus, rejectionType = "") => {
    // console.log("BId in updateStaTus of requests.js: ", bookingId);

    const reqIndex = requests.findIndex(r => r.bookingId === bookingId);
    if (reqIndex === -1) return;

    const requestData = requests[reqIndex];
    const timerInfo = timers[bookingId];
    const elapsedSec = timerInfo?.startTime
      ? Math.floor((Date.now() - timerInfo.startTime) / 1000)
      : 0;

    try {
      // ✅ CASE 1: Rejected - use /reject-request
      if (newStatus.toLowerCase().trim() === "rejected") {
        await axios.post("http://localhost:3001/api/partners/reject-request", {
          partnerId,
          bookingId,
          rejectionType: rejectionType || "manual",
        });

        // Optional: Save rejection time
        setRejectedTimes((prev) => ({ ...prev, [bookingId]: elapsedSec }));

      } else {
        // ✅ CASE 2: All others - use update-request-status
        await axios.post("http://localhost:3001/api/partners/update-request-status", {
          partnerId,
          requestId: bookingId,
          newStatus: newStatus.toLowerCase().trim(),
        });

        if (newStatus.toLowerCase().trim() === "accepted") {
          // console.log(`Updated request ${bookingId} to status: ${newStatus}`);
          setAcceptedTimes((prev) => ({ ...prev, [bookingId]: elapsedSec }));
        }
      }

      // if (["accepted", "rejected"].includes(newStatus.toLowerCase().trim())) {
      //   fetchRequests(); // refetch after status update
      // }

      if (["accepted", "rejected"].includes(newStatus.toLowerCase().trim())) {
        const updatedRequests = [...requests];
        updatedRequests[reqIndex].status = newStatus;
        setRequests(updatedRequests);

        setTimeout(() => fetchRequests(), 1000);
      }

      // Save response time
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

      <div className="partner-requests-date-filter">
        <label>
          Date:{" "}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setStatusFilter("Requested");
            }}
            max={dayjs().format("YYYY-MM-DD")}
          />
        </label>

        {/* {filteredRequests.length > 0 && ( */}
        <label>
          Status:{" "}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All Requests">All Requests</option>
            <option value="Requested">Requested</option>
            <option value="Driver Assigned">Driver Assigned</option>
            <option value="Rejected">Manual Rejected</option>
            <option value="Auto Rejected">Auto Rejected</option>
          </select>
        </label>
        {/* )} */}

        <button
          onClick={() => {
            setDateFilter(dayjs().format("YYYY-MM-DD"));
            setStatusFilter("All Requests");
          }}
        >
          Today
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="no-requests-message">No requests found for <b>{statusFilter}</b> filter.</div>
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
            {filteredRequests.map((req, index) => {
              const bookingId = req.bookingId;
              const status = req.status?.toLowerCase().trim();

              return (
                <tr key={bookingId}>
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
                    {status === "requested" &&
                      timers[bookingId]?.isRunning &&
                      (() => {
                        const { urgencyDuration, startTime } = timers[bookingId];
                        const elapsed = Math.floor((Date.now() - startTime) / 1000);
                        const remaining = Math.max(urgencyDuration - elapsed, 0);

                        return (
                          <CountdownCircleTimer
                            key={bookingId}
                            isPlaying
                            duration={urgencyDuration}
                            initialRemainingTime={remaining}
                            colors={["#00ff00", "#ff7d29", "#ff0000", "#ff0000"]}
                            colorsTime={[urgencyDuration, urgencyDuration / 2, urgencyDuration / 4, 0]}
                            strokeWidth={8}
                            size={60}
                            onComplete={() => {
                              const reqIndex = requests.findIndex((r) => r.bookingId === bookingId);
                              const currentStatus = requests[reqIndex]?.status?.toLowerCase();

                              if (currentStatus === "requested" && timers[bookingId]?.isRunning) {
                                updateStatus(bookingId, "rejected", "auto");
                              }
                              return [false, 0];
                            }}

                          >
                            {({ remainingTime }) => (
                              <div style={{ fontSize: "14px" }}>{remainingTime}s</div>
                            )}
                          </CountdownCircleTimer>
                        );
                      })()}
                    {AcceptedTimes[bookingId] && (
                      <div className="Accepted-time">✅ Accepted in {AcceptedTimes[bookingId]}s</div>
                    )}
                    {rejectedTimes[bookingId] && (
                      <div className="rejected-time">❌ Rejected in {rejectedTimes[bookingId]}s</div>
                    )}
                  </td>
                  <td>
                    <div className="partner-request-actions-btn">
                      {!['assigned', 'assigned_by_individual_driver'].includes(status) && (
                        <>
                          <button
                            className="btn accept"
                            onClick={() => updateStatus(req.bookingId, "accepted")}
                            disabled={["accepted", "assigned", "assigned_by_individual_driver"].includes(status)}
                          >
                            Accept
                          </button>

                          <button
                            className="btn reject"
                            onClick={() => updateStatus(req.bookingId, "rejected", "manual")}
                            disabled={["rejected", "assigned", "accepted", "assigned_by_individual_driver"].includes(status)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {['assigned', 'assigned_by_individual_driver'].includes(req.status?.toLowerCase().trim()) && (
                        <p className="assigned-tag">No action</p>
                      )}
                      {status === "accepted" && (
                        <button className="btn assign" onClick={() => handleAssignDriver(req)}>
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
