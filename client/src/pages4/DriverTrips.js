import React from "react";
import "../styles/DriverTrips.css";

const DriverTrips = () => {
  return (
    <div className="driver-trips">
      <h1>Your Trips</h1>
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
          <tr>
            <td>TRP12345</td>
            <td>2025-05-23</td>
            <td>Hospital A</td>
            <td>Hospital B</td>
            <td>Completed</td>
          </tr>
          <tr>
            <td>TRP12346</td>
            <td>2025-05-22</td>
            <td>Hospital C</td>
            <td>Hospital D</td>
            <td>Cancelled</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DriverTrips;