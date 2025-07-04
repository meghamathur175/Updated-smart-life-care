const express = require("express");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51QFISBF4EHZ1XPSPjvPdYAwcTwrURNqtkEQxPQ0jtuaMisnl24CIG6PgmnocZhMCjplTD5d9rkELmEtMEm1gRZgQ00qZ09paFd"
); // Replace with your real Stripe secret key

router.post("/create-checkout-session", async (req, res) => {
  const { amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Ambulance Booking",
            },
            unit_amount: amount * 100, // Stripe expects amount in paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/payment-success",
      cancel_url: "http://localhost:3000/payment-cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
