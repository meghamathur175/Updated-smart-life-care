import React from "react";
import { Link } from "react-router-dom";
//import "../styles/PaymentResult.css";

const PaymentSuccess = () => {
  return (
    <div className="payment-result-container">
      <div className="payment-result success">
        <h2>🎉 Payment Successful!</h2>
        <p>Thank you! Your payment has been processed successfully.</p>
        <Link to="/" className="btn-home">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
