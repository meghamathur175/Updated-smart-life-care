const mongoose = require("mongoose");

const ambulanceRequestSchema = new mongoose.Schema(
  {
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    urgency: {
      type: String,
      enum: [
        "Normal - Stable condition",
        "Priority - Needs quicker assistance",
        "Emergency - Life-threatening, immediate action required",
      ],
      required: true,
      trim: true
    },
    distance: String,
    duration: String,
    amount: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AmbulanceRequest", ambulanceRequestSchema);
