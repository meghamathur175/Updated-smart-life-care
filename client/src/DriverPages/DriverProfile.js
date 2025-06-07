// import React, { useEffect, useState } from "react";
// import "../styles/DriverProfile.css";
// import { useNavigate } from "react-router-dom";

// const DriverProfile = () => {
//   const [driver, setDriver] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedDriver = localStorage.getItem("driver");
//     if (storedDriver) {
//       setDriver(JSON.parse(storedDriver));
//     } else {
//       // Redirect if not logged in
//       navigate("/driver-login");
//     }
//   }, [navigate]);

//   if (!driver) return null;

//   return (
//     <div className="driver-profile">
//       <h1>Your Profile</h1>
//       <div className="profile-info">
//         <p>
//           <strong>Name:</strong> {driver.name}
//         </p>
//         <p>
//           <strong>Email:</strong> {driver.email}
//         </p>
//         <p>
//           <strong>Phone:</strong> {driver.phone}
//         </p>
//         <p>
//           <strong>License Number:</strong> {driver.licenseNumber}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default DriverProfile;

import React, { useEffect, useState } from "react";
import "../styles/DriverProfile.css";
import { useNavigate } from "react-router-dom";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedDriver = localStorage.getItem("driver");
    if (storedDriver) {
      setDriver(JSON.parse(storedDriver));
    } else {
      navigate("/driver-login");
    }
  }, [navigate]);

  if (!driver) return null;

  return (
    <div className="driver-profile">
      <h1>Your Profile</h1>
      <div className="profile-info">
        <p>
          <strong>Full Name:</strong> {driver.firstName} {driver.lastName}
        </p>
        <p>
          <strong>Age:</strong> {driver.age || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {driver.email}
        </p>
        <p>
          <strong>Phone:</strong> {driver.phone}
        </p>
        <p>
          <strong>License Number:</strong> {driver.licenseNumber}
        </p>
        <p>
          <strong>Vehicle Type:</strong> {driver.vehicleType || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default DriverProfile;
