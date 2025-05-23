// Reports.js
import React, { useState } from "react";
import "../styles/Reports.css";

function Reports() {
  const [filter, setFilter] = useState("daily");

  const data = [
    { date: "2025-05-12", trips: 12, accepted: 10, rejected: 2 },
    { date: "2025-05-13", trips: 9, accepted: 7, rejected: 2 },
    { date: "2025-05-06", trips: 20, accepted: 18, rejected: 2 }, // for weekly view mock
  ];

  const filteredData = filter === "daily" ? data.slice(0, 2) : data;

  const totalTrips = filteredData.reduce((sum, d) => sum + d.trips, 0);
  const totalAccepted = filteredData.reduce((sum, d) => sum + d.accepted, 0);
  const totalRejected = filteredData.reduce((sum, d) => sum + d.rejected, 0);
  const acceptanceRate = ((totalAccepted / totalTrips) * 100).toFixed(1);

  const downloadCSV = () => {
    const header = ["Date", "Total Trips", "Accepted", "Rejected"];
    const rows = filteredData.map((d) => [
      d.date,
      d.trips,
      d.accepted,
      d.rejected,
    ]);
    const csvContent =
      [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report-${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Daily/Weekly Summary Report</h2>
        <button className="download-button" onClick={downloadCSV}>
          Download Report
        </button>
      </div>

      <div className="filter-buttons">
        <button
          className={filter === "daily" ? "active" : ""}
          onClick={() => setFilter("daily")}
        >
          Daily
        </button>
        <button
          className={filter === "weekly" ? "active" : ""}
          onClick={() => setFilter("weekly")}
        >
          Weekly
        </button>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Trips</h3>
          <p>{totalTrips}</p>
        </div>
        <div className="card">
          <h3>Total Accepted</h3>
          <p>{totalAccepted}</p>
        </div>
        <div className="card">
          <h3>Total Rejected</h3>
          <p>{totalRejected}</p>
        </div>
        <div className="card">
          <h3>Acceptance Rate</h3>
          <p>{acceptanceRate}%</p>
        </div>
      </div>

      <table className="reports-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Total Trips</th>
            <th>Accepted</th>
            <th>Rejected</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((d, idx) => (
            <tr key={idx}>
              <td>{d.date}</td>
              <td>{d.trips}</td>
              <td>{d.accepted}</td>
              <td>{d.rejected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Reports;
