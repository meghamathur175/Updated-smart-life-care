// Request.js
import React, { useState } from "react";
import "../styles/Request.css";

function Request() {
  const [requests, setRequests] = useState([
    { id: 1, name: "Patient A", location: "Delhi", status: "Pending" },
    { id: 2, name: "Patient B", location: "Mumbai", status: "Pending" },
  ]);

  const updateStatus = (id, newStatus) => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setRequests(updated);
  };

  return (
    <div className="request-table-container">
      <h2>🚑 Ambulance Requests</h2>
      <table className="request-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient Name</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.name}</td>
              <td>{req.location}</td>
              <td>
                <span className={`status ${req.status.toLowerCase()}`}>
                  {req.status}
                </span>
              </td>
              <td>
                <button
                  className="btn accept"
                  onClick={() => updateStatus(req.id, "Accepted")}
                >
                  Accept
                </button>
                <button
                  className="btn reject"
                  onClick={() => updateStatus(req.id, "Rejected")}
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
