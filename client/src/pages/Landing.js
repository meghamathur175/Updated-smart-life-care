import React from 'react'
import Navbar from '../components/navbar'
import FooterSection from '../components/footer'
import bannerPage from "../images/Landing.png"
import AmbulanceScene from '../components/AmbulanceAnimation'
import Testimonial from '../components/Testimonials'
import Hero from '../components/hero'
import "../styles/landing.css";
import doctor from "../images/doctor.png"

const LandingPage = () => {
  return (
    <>
      <Navbar />

      <div className="landing-wrapper">
        <div className="banner-container">
          {/* Left side image */}
          <div className="left-content">
            <img
              src={doctor}
              alt="Left Banner"
              className="left-image"
            />
          </div>

          {/* Right side: heading + banner image */}
          <div className="right-content">
            <h1>Welcome to Our Amazing Site</h1>
            <img
              src={bannerPage}
              alt="Right Banner"
              className="banner-image"
            />
          </div>
        </div>
      </div>


      <Hero />
      <AmbulanceScene />
      <Testimonial />
      <FooterSection />
    </>
  );
}

export default LandingPage;
