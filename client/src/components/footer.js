import React from 'react';
import '../styles/footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUp } from '@fortawesome/free-solid-svg-icons';

const FooterSection = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="goUp" onClick={scrollToTop}>
        <FontAwesomeIcon icon={faCircleUp} className="goUp-icon" />
      </div>

      <div className="footer-container">

        {/* Company Info */}
        <div className="footer-column">
          <h4>Life+ Ambulance</h4>
          <p>Helping you in emergencies with quick and reliable ambulance services, anytime, anywhere.</p>
        </div>

        {/* Social Media */}
        <div className="footer-column">
          <h4>Social Media</h4>
          <ul className="social-links">
            <li><FaFacebookF /> Facebook</li>
            <li><FaTwitter /> Twitter</li>
            <li><FaInstagram /> Instagram</li>
            <li><FaLinkedinIn /> LinkedIn</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-column">
          <h4>Contact</h4>
          <p>Email: support@lifeplus.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>Location: Bangalore, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Life+. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default FooterSection;

