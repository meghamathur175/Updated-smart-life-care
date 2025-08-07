const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    licenseNumber: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ambulancePlate: { type: String, required: true },
    vehicleType: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agency Register", agencySchema);
