import React from 'react';
import '../styles/hero.css'
import { FaAmbulance, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 

function Hero() {
  return (
    <div className="app">
      <HeroSection />
      <HowItWorks />
      <StatsSection />
    </div>
  );
}

function HeroSection() {
  const navigate = useNavigate();

  let buttonHandler = () => {
    navigate('/request-ambulance');
  }
  
  return (
    <section className="hero">
      <h1>Revolutionizing Emergency Healthcare</h1>
      <p>Fast. Smart. Life-saving ambulance dispatching.</p>
      <button onClick={buttonHandler}>🚑 Request Ambulance</button>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <div className="steps">
        <Step
          icon={<FaMapMarkerAlt className="icon" />}
          title="1. Request Help"
          description="Use our app or website to submit an emergency request with your live location. It’s quick, simple, and life-saving."
        />
        <Step
          icon={<FaClock className="icon" />}
          title="2. Nearest Hospital Responds"
          description="Your request is instantly sent to the nearest available hospital, ensuring the fastest possible response time."
        />
        <Step
          icon={<FaAmbulance className="icon" />}
          title="3. Ambulance on the Way"
          description="Once Accepted, an ambulance is dispatched immediately and you can track its arrival in real time."
        />
      </div>
    </section>
  );
}

function Step({ icon, title, description }) {
  return (
    <div className="step">
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="stats">
      <h2>Our Impact</h2>
      <div className="stat-grid">
        <Stat number="1,250+" label="Lives Saved" />
        <Stat number="47" label="Partner Hospitals" />
        <Stat number="8 mins" label="Avg Response Time" />
      </div>
    </section>
  );
}

function Stat({ number, label }) {
  return (
    <div className="stat">
      <h3>{number}</h3>
      <p>{label}</p>
    </div>
  );
}

export default Hero;