import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Reports.css";

function Reports() {
  const [filter, setFilter] = useState("daily");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const partnerId = localStorage.getItem("partnerId");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/partners/${partnerId}/reports`);
        console.log("RESPONSE: ", response);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch report data", error);
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const filteredData = filter === "daily" ? data.slice(-1) : data.slice(data.length-7);

  const totalTrips = filteredData.reduce((sum, d) => sum + d.trips, 0);
  const totalAccepted = filteredData.reduce((sum, d) => sum + d.accepted, 0);
  const totalRejected = filteredData.reduce((sum, d) => sum + d.rejected, 0);
  const acceptanceRate = totalTrips
    ? ((totalAccepted / totalTrips) * 100).toFixed(1)
    : 0;

  const downloadCSV = () => {
    const header = ["Date", "Total Trips", "Accepted", "Rejected"];
    const rows = filteredData.map((d) => [
      d.date,
      d.trips,
      d.accepted,
      d.rejected,
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

  if (loading) {
    return <div className="reports-container">Loading report data...</div>;
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Summary Report ({filter.charAt(0).toUpperCase() + filter.slice(1)})</h2>
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
