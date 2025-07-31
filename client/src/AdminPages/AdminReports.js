import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminReports.css";

function Reports() {
  const [filter, setFilter] = useState("daily");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);
  const [reportType, setReportType] = useState("Overall");
  const [distanceRevenue, setDistanceRevenue] = useState(0);
  const [commissionRevenue, setCommissionRevenue] = useState(0);

  const selectedPartnerName =
    reportType === "Overall"
      ? "Overall"
      : partners.find((p) => p._id === reportType)?.name || "Partner";

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        if (reportType === "Overall") {
          const response = await axios.get("http://localhost:3001/api/admin/admin-reports");
          setData(response.data);
        } else {
          const response = await axios.get(`http://localhost:3001/api/partners/${reportType}/reports`);
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(fetchReports, 1000);
  }, [reportType]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/partners");
        setPartners(response.data);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };
    setTimeout(fetchPartners, 1000);
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const filteredData =
    filter === "daily"
      ? data.filter((d) => d.date === today)
      : filter === "weekly"
      ? data.slice(-7)
      : data;

  let totalTrips = 0;
  let totalAccepted = 0;
  let totalRejected = 0;

  filteredData.forEach((report) => {

    totalTrips += report.trips || 0;
    totalAccepted += report.accepted || 0;
    totalRejected += report.rejected || 0;
  });

  const totalRevenue = filteredData.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const acceptanceRate = totalTrips > 0 ? ((totalAccepted / totalTrips) * 100).toFixed(2) : 0;

  // ✅ Compute commission and distance based revenue from totalRevenue
  useEffect(() => {
    const commission = totalRevenue * 0.2;
    const distance = totalRevenue * 0.8;
    setCommissionRevenue(commission.toFixed(2));
    setDistanceRevenue(distance.toFixed(2));
  }, [totalRevenue]);

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
      <select
        className="select-hospital-name"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="Overall">Overall</option>
        {partners.map((partner) => (
          <option key={partner._id} value={partner._id}>
            {partner.name}
          </option>
        ))}
      </select>

      <div className="reports-header">
        <h2>
          {selectedPartnerName} Summary Report (
          {filter.charAt(0).toUpperCase() + filter.slice(1)} )
        </h2>
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
        <div className="card card-Accepted">
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
        <div className="card card-revenue">
          <h3>Distance Based Revenue</h3>
          <p>₹{distanceRevenue}</p>
        </div>
        <div className="card card-revenue">
          <h3>Commission Based Revenue</h3>
          <p>₹{commissionRevenue}</p>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;
