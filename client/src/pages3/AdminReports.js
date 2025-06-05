import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminReports.css";

function Reports() {
  const [filter, setFilter] = useState("daily");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/admin/admin-reports");
        console.log("Reports fetched:", response.data);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching admin reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);


  const filteredData =
    filter === "daily" ? data.slice(-1)
      : filter === "weekly" ? data.slice(0, 7)
        : data;

  let totalTrips = 0;
  let totalAccepted = 0;
  let totalRejected = 0;

  data.forEach((report) => {
    totalTrips += report.trips;
    totalAccepted += report.accepted;
    totalRejected += report.rejected;
  });

  const totalRevenue = data.reduce((sum, r) => sum + r.revenue, 0);
  const totalReferrals = data.reduce((sum, r) => sum + r.referrals, 0);
  const acceptanceRate = totalTrips > 0 ? ((totalAccepted / totalTrips) * 100).toFixed(2) : 0;


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

  if (loading) return <div className="reports-container">Loading reports...</div>;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Summary Report ({filter.charAt(0).toUpperCase() + filter.slice(1)})</h2>
        <button className="download-button" onClick={downloadCSV}>Download Report</button>
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
        <div className="card card-trips"><h3>Total Trips</h3><p>{totalTrips}</p></div>
        <div className="card card-accepted"><h3>Total Accepted</h3><p>{totalAccepted}</p></div>
        <div className="card card-rejected"><h3>Total Rejected</h3><p>{totalRejected}</p></div>
        <div className="card card-rate"><h3>Acceptance Rate</h3><p>{acceptanceRate}%</p></div>
        <div className="card card-revenue"><h3>Total Revenue</h3><p>₹{totalRevenue}</p></div>
        <div className="card card-referrals"><h3>Total Referrals</h3><p>{totalReferrals}</p></div>
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
