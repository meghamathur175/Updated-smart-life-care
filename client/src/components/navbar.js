import React, { useState } from "react";
import "../styles/navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { useLogin } from "../LoginContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const { isLoggedIn, setIsLoggedIn } = useLogin();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userToken");
    setIsLoggedIn(false);
    setShowConfirm(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <nav className="home-navbar">
        <div className="home-navbar-content">
          <div className="home-menu-toggle" onClick={toggleMenu}>
            {menuOpen ? (
              <span className="home-close-icon">&times;</span>
            ) : (
              <GiHamburgerMenu size={28} color="#2563eb" />
            )}
          </div>

          <div className="home-navbar-logo">
            <h2>Life+</h2>
          </div>

          <div className={`home-navbar-links ${menuOpen ? "home-open" : ""}`}>
            <Link className="home-nav-link" to="/request-ambulance" onClick={closeMenu}>
              Request Ambulance
            </Link>
            <Link className="home-nav-link" to="/track-ambulance" onClick={closeMenu}>
              Track Ambulance
            </Link>

            {!isLoggedIn ? (
              <Link className="home-nav-link" to="/SignIn" onClick={closeMenu}>
                Login
              </Link>
            ) : (
              <Link
                to="#"
                className="home-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  closeMenu();
                  handleLogout();
                }}
              >
                Logout
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Are you sure you want to logout?</h4>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={confirmLogout}>Yes</button>
              <button className="btn-secondary" onClick={cancelLogout}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
