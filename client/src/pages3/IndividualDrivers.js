import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/PartnerDrivers.css";

const IndividualDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIndividualDrivers = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/drivers/all");
        console.log("API response:", res.data);

        setDrivers(Array.isArray(res.data) ? res.data : res.data.drivers);
      } catch (err) {
        console.error("Failed to fetch individual drivers:", err);
      }
    };

    fetchIndividualDrivers();
  }, []);

  return (
    <div className="partner-drivers-list">
      <h2>Registered Drivers</h2>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>License Number</th>
            <th>Age</th>
            <th>Vehicle Type</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(drivers) &&
            drivers.map((driver, index) => (
              <tr
                key={driver._id}
                onClick={() =>
                  navigate("/admin-dashboard/individual-driver-details", {
                    state: { driver },
                  })
                }
                style={{ cursor: "pointer" }}
              >
                <td>{index + 1}</td>
                <td>
                  {driver.firstName} {driver.lastName}
                </td>
                <td>{driver.email}</td>
                <td>{driver.phone}</td>
                <td>{driver.licenseNumber}</td>
                <td>{driver.age}</td>
                <td>{driver.vehicleType}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default IndividualDrivers;
