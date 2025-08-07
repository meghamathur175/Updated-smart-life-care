const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  ambulanceType: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  commission: { type: Number, default: 3 },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
});

driverSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("DriverOnboard", driverSchema);
