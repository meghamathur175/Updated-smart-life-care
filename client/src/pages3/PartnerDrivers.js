import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/PartnerDrivers.css";

const PartnerDrivers = () => {
  const [partnerDrivers, setPartnerDrivers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartnerDrivers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3001/api/partner-drivers"
        );
        setPartnerDrivers(res.data);
      } catch (err) {
        console.error("Failed to fetch partner drivers:", err);
      }
    };

    fetchPartnerDrivers();
  }, []);

  return (
    <div className="partner-drivers-list">
      <h2>Registered Partner Drivers</h2>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Hospital Name</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Vehicle Type</th>
          </tr>
        </thead>
        <tbody>
          {partnerDrivers.map((driver, index) => (
            <tr
              key={driver._id}
              onClick={() =>
                navigate("/admin-dashboard/partner-driver-details", {
                  state: { driver },
                })
              }
              style={{ cursor: "pointer" }}
            >
              <td>{index + 1}</td>
              <td>{driver.hospitalName}</td>
              <td>{driver.name}</td>
              <td>{driver.phone}</td>
              <td>{driver.address}</td>
              <td>{driver.vehicleType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PartnerDrivers;
