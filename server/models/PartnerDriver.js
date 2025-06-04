const mongoose = require("mongoose");

const partnerDriverSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
    trim: true,
  },

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

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PartnerDriver", partnerDriverSchema);
