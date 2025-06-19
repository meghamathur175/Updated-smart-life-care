const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hospitalPlaceId: { type: String, required: true, unique: true, trim: true },
    location: { type: String, required: true },
    serviceAreas: { type: String, required: true },
    commission: { type: Number, required: true, min: 3, max: 5 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Only required during registration
    },

    pendingRequests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', trim: true },
        userName: { type: String, required: true, trim: true },
        patientName: { type: String, trim: true },
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', trim: true },
        pickup: { type: String, required: true, trim: true },
        drop: { type: String, required: true, trim: true },
        urgency: { type: String, enum: ["Normal", "Urgent", "Emergency"], required: true, trim: true },
        ambulanceType: {
          type: String, 
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
          ], required: true, trim: true
        },
        ambulanceCost: { type: Number, default: 0 },
        status: { type: String, default: "requested", trim: true },
        timestamp: { type: Date, default: Date.now, trim: true },
        bookingId: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partner", partnerSchema);

