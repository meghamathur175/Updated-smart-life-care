import React from "react";
import "../styles/DriverTrips.css";

const DriverTrips = () => {
  const trips = [
    {
      id: "TRP12345",
      date: "2025-05-23",
      pickup: "Hospital A",
      dropoff: "Hospital B",
      status: "Completed",
    },
    {
      id: "TRP12346",
      date: "2025-05-22",
      pickup: "Hospital C",
      dropoff: "Hospital D",
      status: "Cancelled",
    },
  ];

  const downloadCSV = () => {
    const header = ["Trip ID", "Date", "Pickup", "Dropoff", "Status"];
    const rows = trips.map((trip) => [
      trip.id,
      trip.date,
      trip.pickup,
      trip.dropoff,
      trip.status,
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "driver-trips.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="driver-trips">
      <div className="trips-header">
        <h1>Your Trips</h1>
        <button className="download-button" onClick={downloadCSV}>
          Download Trip Details
        </button>
      </div>

      <table className="trips-table">
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Date</th>
            <th>Pickup</th>
            <th>Dropoff</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip, index) => (
            <tr key={index}>
              <td>{trip.id}</td>
              <td>{trip.date}</td>
              <td>{trip.pickup}</td>
              <td>{trip.dropoff}</td>
              <td>{trip.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverTrips;
