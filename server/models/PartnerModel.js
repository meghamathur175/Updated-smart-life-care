const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hospitalPlaceId: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true, },
    location: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
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
        ambulanceType: {
          type: String,
          enum: [
            "Basic Life Support (No oxygen cylinder)",
            "Advanced Life Support (With oxygen, medical equipment, trained staff)",
            "Critical Care Ambulance(Ambulance with doctor)",
          ], required: true, trim: true
        },
        ambulanceCost: { type: Number, default: 0 },
        status: { type: String, default: "requested", trim: true },
        timestamp: { type: Date, default: Date.now, trim: true },
        bookingId: String,
        distance: { type: Number, min: 0 },
        reassignedPartners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Partner' }], 
        reassignedPartnerNames: [String], 
        rejectedByPartnerName: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
partnerSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Partner", partnerSchema);