import React from "react";
import { Link } from "react-router-dom";
//import "../styles/PaymentResult.css";

const PaymentCancel = () => {
  return (
    <div className="payment-result-container">
      <div className="payment-result cancel">
        <h2>❌ Payment Cancelled</h2>
        <p>
          Your payment was cancelled. Please try again if you still wish to
          proceed.
        </p>
        <Link to="/" className="btn-home">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
