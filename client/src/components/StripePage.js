// import { loadStripe } from "@stripe/stripe-js";
// import React from "react";
// import { useLocation } from "react-router-dom";

// const stripePromise = loadStripe(
//   "pk_test_51QFISBF4EHZ1XPSP7behUzGAYtRdNtBMeJVAU97MtRSEB2FETru3RKHzZuXaPu6Cyj4zoaKeuccO6FjKuGEvCtV700IdlCGch2"
// );

// function StripePage() {
//   const { state } = useLocation();
//   const { fullname, email, address, city, pincode, amount } = state || {};

//   const handleCheckout = async () => {
//     const stripe = await stripePromise;

//     const response = await fetch("http://localhost:3001/api/cart/makePayment", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: localStorage.getItem("userToken"),
//       },
//       body: JSON.stringify({
//         fullname,
//         email,
//         address,
//         city,
//         pincode,
//         amount,
//         userId: JSON.parse(localStorage.getItem("loggedInUser"))._id,
//       }),
//     });

//     const { id: sessionId } = await response.json();
//     const { error } = await stripe.redirectToCheckout({ sessionId });

//     if (error) {
//       console.error("Error redirecting to Stripe Checkout:", error);
//     }
//   };

//   return (
//     <button
//       onClick={handleCheckout}
//       disabled={!fullname || !email || !address || !city || !pincode}
//       className="btn btn-primary w-100 m-2"
//     >
//       Checkout with Stripe
//     </button>
//   );
// }

// export default StripePage;

import { loadStripe } from "@stripe/stripe-js";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Load Stripe public key
const stripePromise = loadStripe(
  "pk_test_51QFISBF4EHZ1XPSP7behUzGAYtRdNtBMeJVAU97MtRSEB2FETru3RKHzZuXaPu6Cyj4zoaKeuccO6FjKuGEvCtV700IdlCGch2"
);

function StripePage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { fullname, email, address, city, pincode, amount } = state || {};

  useEffect(() => {
    // Redirect if required fields are missing
    if (!fullname || !email || !address || !city || !pincode || !amount) {
      alert("Missing required checkout details. Redirecting...");
      navigate("/stripe-payment"); // change route if needed
    }
  }, [fullname, email, address, city, pincode, amount, navigate]);

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;

      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      const token = localStorage.getItem("userToken");

      const response = await fetch(
        "http://localhost:3001/api/cart/makePayment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            fullname,
            email,
            address,
            city,
            pincode,
            amount,
            userId: user?._id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create Stripe session");
      }

      const { id: sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Stripe redirect error:", error.message);
        alert("Stripe checkout failed.");
      }
    } catch (err) {
      console.error("Error during checkout:", err.message);
      alert("Something went wrong during checkout.");
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Confirm Payment</h3>
      <ul className="list-group mb-4">
        <li className="list-group-item">Full Name: {fullname}</li>
        <li className="list-group-item">Email: {email}</li>
        <li className="list-group-item">Address: {address}</li>
        <li className="list-group-item">City: {city}</li>
        <li className="list-group-item">Pincode: {pincode}</li>
        <li className="list-group-item">Amount: ₹{amount}</li>
      </ul>

      <button
        onClick={handleCheckout}
        disabled={
          !fullname || !email || !address || !city || !pincode || !amount
        }
        className="btn btn-primary w-100"
      >
        Checkout with Stripe
      </button>
    </div>
  );
}

export default StripePage;
