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
    available: {
      type: Boolean,
      default: true,
    },
    ambulancePlateNumber: { type: String, required: true },
    profilePic: {
      type: String, // Image URL or base64
      default: "", // Or a placeholder image URL
    },
    status: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available'
    },
    assignedRequestId: { type: String, default: null },
    otp: { type: String, default: "0000" },  

  },
  { timestamps: true } // Adds createdAt and updatedAt
);

module.exports = mongoose.model("PartnerDriver", PartnerDriverSchema);
