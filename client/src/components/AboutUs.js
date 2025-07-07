import React from "react";
import "../styles/AboutUs.css"; // Make sure to create and link the CSS file

const AboutUs = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h2 className="about-title">About Life+</h2>
        <p className="about-paragraph">
          <strong>Life+</strong> is your smart companion for health, safety, and
          emergency care. We’re here to revolutionize the way you access
          critical healthcare services by putting essential tools at your
          fingertips — anytime, anywhere.
        </p>
        <p className="about-paragraph">
          Whether you're booking an ambulance, searching for nearby hospitals,
          or managing your health records, Life+ connects users, ambulance
          drivers, hospitals, and healthcare partners into one unified,
          easy-to-use platform.
        </p>

        <h3 className="about-subtitle">Why Life+</h3>
        <p className="about-paragraph">
          We created Life+ to eliminate delays and confusion during emergencies.
          With features like real-time ambulance tracking, secure user profiles,
          and instant hospital access, Life+ makes sure help reaches you when
          you need it the most.
        </p>

        <h3 className="about-subtitle">Key Features</h3>
        <ul className="about-list">
          <li>🚑 Quick Ambulance Booking</li>
          <li>📍 Live GPS Tracking</li>
          <li>🏥 Nearby Hospital Locator</li>
          <li>📄 Health Records & Medical History</li>
          <li>🤝 Partner & Hospital Dashboard</li>
          <li>💳 Secure Online Payments</li>
        </ul>

        <h3 className="about-subtitle">Our Mission</h3>
        <p className="about-paragraph">
          To transform emergency response and healthcare accessibility through
          smart, real-time technology that puts people first.
        </p>

        <h3 className="about-subtitle">Our Vision</h3>
        <p className="about-paragraph">
          To build a healthier, safer society where emergency care is fast,
          connected, and always within reach — no matter where you are.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
