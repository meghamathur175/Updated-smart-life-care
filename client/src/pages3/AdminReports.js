import React, { useState } from "react";
import "../styles/AdminReports.css";

function Reports() {
  const [filter, setFilter] = useState("daily");

  const data = [
    { date: "2025-05-12", trips: 12, accepted: 10, rejected: 2, revenue: 500, referrals: 3 },
    { date: "2025-05-13", trips: 9, accepted: 7, rejected: 2, revenue: 900, referrals: 2 },
    { date: "2025-05-06", trips: 20, accepted: 18, rejected: 2, revenue: 2000, referrals: 5 },
    { date: "2025-04-25", trips: 15, accepted: 14, rejected: 1, revenue: 1500, referrals: 4 },
  ];

  const filteredData =
    filter === "daily" ? data.slice(0, 2)
    : filter === "weekly" ? data.slice(0, 3)
    : data;

  const totalTrips = filteredData.reduce((sum, d) => sum + d.trips, 0);
  const totalAccepted = filteredData.reduce((sum, d) => sum + d.accepted, 0);
  const totalRejected = filteredData.reduce((sum, d) => sum + d.rejected, 0);
  const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0);
  const totalReferrals = filteredData.reduce((sum, d) => sum + d.referrals, 0);
  const acceptanceRate = ((totalAccepted / totalTrips) * 100).toFixed(1);

  const downloadCSV = () => {
    const header = ["Date", "Trips", "Accepted", "Rejected", "Revenue", "Referrals"];
    const rows = filteredData.map((d) => [
      d.date,
      d.trips,
      d.accepted,
      d.rejected,
      d.revenue,
      d.referrals,
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
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
        <h2>Summary Report ({filter.charAt(0).toUpperCase() + filter.slice(1)})</h2>
        <button className="download-button" onClick={downloadCSV}>
          Download Report
        </button>
      </div>

      <div className="filter-buttons">
        {["daily", "weekly", "monthly"].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="summary-cards">
        <div className="card card-trips">
          <h3>Total Trips</h3>
          <p>{totalTrips}</p>
        </div>
        <div className="card card-accepted">
          <h3>Total Accepted</h3>
          <p>{totalAccepted}</p>
        </div>
        <div className="card card-rejected">
          <h3>Total Rejected</h3>
          <p>{totalRejected}</p> 
        </div>
        <div className="card card-rate">
          <h3>Acceptance Rate</h3>
          <p>{acceptanceRate}%</p>
        </div>
        <div className="card card-revenue">
          <h3>Total Revenue</h3>
          <p>₹{totalRevenue}</p>
        </div>
        <div className="card card-referrals">
          <h3>Total Referrals</h3>
          <p>{totalReferrals}</p>
        </div>
      </div>

      <div className="reports-table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Trips</th>
              <th>Accepted</th>
              <th>Rejected</th>
              <th>Revenue</th>
              <th>Referrals</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d, idx) => (
              <tr key={idx}>
                <td>{d.date}</td>
                <td>{d.trips}</td>
                <td>{d.accepted}</td>
                <td>{d.rejected}</td>
                <td>₹{d.revenue}</td>
                <td>{d.referrals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;
