const mongoose = require("mongoose");

const PartnerDriverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: [
        "Basic Life Support (BLS)",
        "Advanced Life Support (ALS)",
        "Patient Transport Ambulance (PTA)",
        "Neonatal Ambulance",
        "Mortuary Ambulance",
        "Air Ambulance",
        "Water Ambulance",
        "4x4 Ambulance",
        "ICU Ambulance",
        "Cardiac Ambulance",
      ],
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HospitalPartner",
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model("PartnerDriver", PartnerDriverSchema);
