// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/DriverAuth.css";

// const DriverRegister = () => {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     age: "",
//     email: "",
//     password: "",
//     phone: "",
//     licenseNumber: "",
//     vehicleType: "Neonatal Ambulance",
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const validate = () => {
//     const newErrors = {};
//     const nameRegex = /^[A-Za-z\s]+$/;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneRegex = /^\d{10}$/;

//     if (!formData.firstName || !nameRegex.test(formData.firstName)) {
//       newErrors.firstName = "Valid first name is required";
//     }

//     if (!formData.lastName || !nameRegex.test(formData.lastName)) {
//       newErrors.lastName = "Valid last name is required";
//     }

//     if (!formData.age || formData.age < 18 || formData.age > 65) {
//       newErrors.age = "Age must be between 18 and 65";
//     }

//     if (!formData.email || !emailRegex.test(formData.email)) {
//       newErrors.email = "Valid email is required";
//     }

//     if (!formData.password || formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     if (!formData.phone || !phoneRegex.test(formData.phone)) {
//       newErrors.phone = "Phone number must be 10 digits";
//     }

//     if (!formData.licenseNumber) {
//       newErrors.licenseNumber = "License number is required";
//     }

//     if (!formData.vehicleType) {
//       newErrors.vehicleType = "Vehicle type is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setLoading(true);

//     try {
//       const res = await fetch("http://localhost:3001/api/drivers/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (res.status === 201 && data.status === "success") {
//         localStorage.setItem("driver", JSON.stringify(data.driver));
//         localStorage.setItem("driverToken", data.token);

//         alert("Registration successful!");
//         navigate("/driver-dashboard", { replace: true });
//       } else {
//         alert(data.message || "Registration failed");
//       }
//     } catch (error) {
//       console.error("Registration error:", error);
//       alert("Something went wrong. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <form className="driver-login-form" onSubmit={handleSubmit}>
//         <h2 className="login-title">Driver Registration</h2>

//         {[
//           { label: "First Name", name: "firstName", type: "text" },
//           { label: "Last Name", name: "lastName", type: "text" },
//           { label: "Age", name: "age", type: "number" },
//           { label: "Email", name: "email", type: "email" },
//           { label: "Phone", name: "phone", type: "text" },
//           { label: "License Number", name: "licenseNumber", type: "text" },
//           { label: "Password", name: "password", type: "password" },
//         ].map(({ label, name, type }) => (
//           <div className="form-group" key={name}>
//             <label className="form-label" htmlFor={name}>
//               {label}
//             </label>
//             <input
//               className="form-control"
//               type={type}
//               id={name}
//               name={name}
//               value={formData[name]}
//               onChange={handleChange}
//               required
//             />
//             {errors[name] && <span className="error">{errors[name]}</span>}
//           </div>
//         ))}

//         <div className="form-group">
//           <label className="form-label" htmlFor="vehicleType">
//             Vehicle Type
//           </label>
//           <select
//             name="vehicleType"
//             value={formData.vehicleType}
//             onChange={handleChange}
//             required
//           >
//             <option value="Basic Life Support (BLS)">
//               Basic Life Support (BLS)
//             </option>
//             <option value="Advanced Life Support (ALS)">
//               Advanced Life Support (ALS)
//             </option>
//             <option value="Patient Transport Ambulance (PTA)">
//               Patient Transport Ambulance (PTA)
//             </option>
//             <option value="Neonatal Ambulance">Neonatal Ambulance</option>
//             <option value="Mortuary Ambulance">Mortuary Ambulance</option>
//             <option value="Air Ambulance">Air Ambulance</option>
//             <option value="Water Ambulance">Water Ambulance</option>
//             <option value="4x4 Ambulance">4x4 Ambulance</option>
//             <option value="ICU Ambulance">ICU Ambulance</option>
//             <option value="Cardiac Ambulance">Cardiac Ambulance</option>
//           </select>

//           {errors.vehicleType && (
//             <span className="error">{errors.vehicleType}</span>
//           )}
//         </div>

//         <button
//           type="submit"
//           className="btn-primary full-width"
//           disabled={loading}
//         >
//           {loading ? "Registering..." : "Register"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default DriverRegister;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DriverAuth.css";

const DriverRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
    phone: "",
    licenseNumber: "",
    vehicleType: "Neonatal Ambulance",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.firstName || !nameRegex.test(formData.firstName)) {
      newErrors.firstName = "Valid first name is required";
    }

    if (!formData.lastName || !nameRegex.test(formData.lastName)) {
      newErrors.lastName = "Valid last name is required";
    }

    if (!formData.age || formData.age < 18 || formData.age > 65) {
      newErrors.age = "Age must be between 18 and 65";
    }

    if (!formData.email || !gmailRegex.test(formData.email)) {
      newErrors.email = "Valid Gmail is required (e.g., example@gmail.com)";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!formData.licenseNumber) {
      newErrors.licenseNumber = "License number is required";
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = "Vehicle type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/drivers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 201 && data.status === "success") {
        localStorage.setItem("driver", JSON.stringify(data.driver));
        localStorage.setItem("driverToken", data.token);

        alert("Registration successful!");
        navigate("/driver-dashboard", { replace: true });
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="driver-login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Driver Registration</h2>

        {[
          { label: "First Name", name: "firstName", type: "text" },
          { label: "Last Name", name: "lastName", type: "text" },
          { label: "Age", name: "age", type: "number" },
          { label: "Email", name: "email", type: "email" },
          { label: "Phone", name: "phone", type: "text" },
          { label: "License Number", name: "licenseNumber", type: "text" },
          { label: "Password", name: "password", type: "password" },
        ].map(({ label, name, type }) => (
          <div className="form-group" key={name}>
            <label className="form-label" htmlFor={name}>
              {label}
            </label>
            <input
              className="form-control"
              type={type}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
            />
            {errors[name] && <span className="error">{errors[name]}</span>}
          </div>
        ))}

        <div className="form-group">
          <label className="form-label" htmlFor="vehicleType">
            Vehicle Type
          </label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            required
          >
            <option value="Basic Life Support (BLS)">
              Basic Life Support (BLS)
            </option>
            <option value="Advanced Life Support (ALS)">
              Advanced Life Support (ALS)
            </option>
            <option value="Patient Transport Ambulance (PTA)">
              Patient Transport Ambulance (PTA)
            </option>
            <option value="Neonatal Ambulance">Neonatal Ambulance</option>
            <option value="Mortuary Ambulance">Mortuary Ambulance</option>
            <option value="Air Ambulance">Air Ambulance</option>
            <option value="Water Ambulance">Water Ambulance</option>
            <option value="4x4 Ambulance">4x4 Ambulance</option>
            <option value="ICU Ambulance">ICU Ambulance</option>
            <option value="Cardiac Ambulance">Cardiac Ambulance</option>
          </select>

          {errors.vehicleType && (
            <span className="error">{errors.vehicleType}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary full-width"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default DriverRegister;
