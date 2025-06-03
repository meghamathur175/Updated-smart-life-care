import React, { useState } from "react";
import "../styles/navbar.css";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="home-navbar">
      <div className="home-navbar-content">
        {/* Hamburger icon (mobile only) */}
        <div className="home-menu-toggle" onClick={toggleMenu}>
          {menuOpen ? (
            <span className="home-close-icon">&times;</span>
          ) : (
            <GiHamburgerMenu size={28} color="#2563eb" />
          )}
        </div>

        {/* Centered logo */}
        <div className="home-navbar-logo">
          <h2>Life+</h2>
        </div>

        {/* Navbar links */}
        <div className={`home-navbar-links ${menuOpen ? "home-open" : ""}`}>
          <Link className="home-nav-link" to="/request-ambulance" onClick={closeMenu}>
            Request Ambulance
          </Link>
          <Link className="home-nav-link" to="/track-ambulance" onClick={closeMenu}>
            Track Ambulance
          </Link>
          <Link className="home-nav-link" to="/SignIn" onClick={closeMenu}>
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
