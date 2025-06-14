// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import "../styles/DriverLogin.css";

// const DriverLoginForm = () => {
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const isOnlyDigits = (value) => /^\d+$/.test(value);

//   const handleIdentifierChange = (e) => {
//     const value = e.target.value;

//     if (isOnlyDigits(value)) {
//       if (value.length <= 10) {
//         setIdentifier(value);
//       }
//     } else {
//       if (/^[0-9@._a-zA-Z+-]*$/.test(value)) {
//         setIdentifier(value);
//       }
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
//     const isPhone = /^\d{10}$/.test(identifier);

//     if (!isEmail && !isPhone) {
//       alert("Please enter a valid email or 10-digit phone number");
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:3001/api/drivers/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: isEmail ? identifier : undefined,
//           phone: isPhone ? identifier : undefined,
//           password,
//         }),
//       });

//       const data = await res.json();

//       if (data.status === "success") {
//         localStorage.setItem("driver", JSON.stringify(data.driver));
//         localStorage.setItem("driverToken", data.token);
//         alert("Driver Logged In");
//         navigate("/driver-dashboard");
//       } else {
//         alert(data.message || "Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       alert("Something went wrong. Please try again.");
//     }
//   };

//   return (
//     <div className="driver-login-box">
//       <h2 className="login-title">Log In as Driver</h2>
//       <form onSubmit={handleLogin}>
//         <div className="form-group">
//           <label htmlFor="identifier">Phone Number or Email</label>
//           <input
//             type="text"
//             id="identifier"
//             className="form-control"
//             placeholder="Enter your phone or email"
//             value={identifier}
//             onChange={handleIdentifierChange}
//             required
//           />
//         </div>

//         <div className="form-group password-group">
//           <label htmlFor="password">Password</label>
//           <div className="password-wrapper">
//             <input
//               type={showPassword ? "text" : "password"}
//               id="password"
//               className="form-control"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <span
//               className="driver-login-password-toggle"
//               onClick={() => setShowPassword(!showPassword)}
//               role="button"
//             >
//               {showPassword ? (
//                 <i className="fa fa-eye-slash" aria-hidden="true"></i>
//               ) : (
//                 <i className="fa fa-eye" aria-hidden="true"></i>
//               )}
//             </span>
//           </div>
//         </div>

//         <button type="submit" className="btn-primary">
//           Log In
//         </button>
//       </form>

//       <div className="extra-links">
//         <Link to="/driver-forgot-password" className="forgot-link">
//           Forgot Password?
//         </Link>
//         <p>
//           Don't have an account?{" "}
//           <Link to="/driver-register" className="register-link">
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default DriverLoginForm;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/DriverLogin.css";

const DriverLoginForm = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      if (value.length <= 10) {
        setIdentifier(value);
      }
    } else {
      setIdentifier(value);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\d{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      alert("Please enter a valid email or 10-digit phone number");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/drivers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: isEmail ? identifier : undefined,
          phone: isPhone ? identifier : undefined,
          password,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("driver", JSON.stringify(data.driver));
        localStorage.setItem("driverToken", data.token);
        alert("Driver Logged In");
        navigate("/driver-dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="driver-login-box">
      <h2 className="form-title">Log In as Driver</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="identifier">Phone Number or Email</label>
          <input
            type="text"
            id="identifier"
            className="form-control"
            placeholder="Enter your phone or email"
            value={identifier}
            onChange={handleIdentifierChange}
            required
          />
        </div>

        <div className="form-group password-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="driver-login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
            >
              {showPassword ? (
                <i className="fa fa-eye-slash" aria-hidden="true"></i>
              ) : (
                <i className="fa fa-eye" aria-hidden="true"></i>
              )}
            </span>
          </div>
        </div>

        <button type="submit" className="btn-primary">
          Log In
        </button>
      </form>

      <div className="extra-links">
        <Link to="/driver-forgot-password" className="forgot-link">
          Forgot Password?
        </Link>
        <p>
          Don't have an account?{" "}
          <Link to="/driver-register" className="register-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DriverLoginForm;
