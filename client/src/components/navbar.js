import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import { useLogin } from "../LoginContext";
import logo from "../images/logo.png"; 
import "../styles/navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  const { isLoggedIn, setIsLoggedIn } = useLogin();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowConfirm(true);
    setDropdownOpen(false);
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

          {/* <div className="home-navbar-logo">
            <Link to="/aboutus">
              <img src={logo} alt="Life+ Logo" className="navbar-logo-img" />
            </Link>
          </div> */}

          <Link to="/aboutus" className="home-navbar-logo">
            <img src={logo} alt="Life Care Logo" className="navbar-logo-img" />
          </Link>

          <div className={`home-navbar-links ${menuOpen ? "home-open" : ""}`}>
            <Link
              className="home-nav-link"
              to="/request-ambulance"
              onClick={closeMenu}
            >
              Request Ambulance
            </Link>
            <Link
              className="home-nav-link"
              to="/track-ambulance"
              onClick={closeMenu}
            >
              Track Ambulance
            </Link>

            {!isLoggedIn ? (
              <Link className="home-nav-link" to="/signin" onClick={closeMenu}>
                Login
              </Link>
            ) : (
              <div className="profile-dropdown">
                <FaUserCircle
                  className="profile-icon"
                  size={28}
                  color="#2563eb"
                  onClick={toggleDropdown}
                />
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => {
                        closeDropdown();
                        closeMenu();
                      }}
                    >
                      Profile
                    </Link>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h4>Are you sure you want to logout?</h4>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={confirmLogout}>
                Yes
              </button>
              <button className="btn-secondary" onClick={cancelLogout}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
