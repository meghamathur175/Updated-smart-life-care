const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    serviceAreas: { type: String, required: true },
    commission: { type: Number, required: true, min: 3, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partner", partnerSchema);
