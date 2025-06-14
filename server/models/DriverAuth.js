const mongoose = require("mongoose");

const driverAuthSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true }, // 👈 add this
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    vehicleType: {
      type: String,
      required: true,
      enum: [
        "Neonatal Ambulance",
        "Mortuary Ambulance",
        "Air Ambulance",
        "Water Ambulance",
        "4x4 Ambulance",
        "ICU Ambulance",
        "Cardiac Ambulance",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverAuthSchema);