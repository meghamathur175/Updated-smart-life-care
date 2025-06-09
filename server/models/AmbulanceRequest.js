const mongoose = require("mongoose");

const ambulanceRequestSchema = new mongoose.Schema(
  {
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    urgency: { type: String, enum: ["non-urgent", "urgent", "critical"], required: true },
    distance: String,
    duration: String,
    amount: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AmbulanceRequest", ambulanceRequestSchema);
