const mongoose = require("mongoose");

const ambulanceRequestSchema = new mongoose.Schema(
  {
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      }
    },
    dropLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      }
    },
    urgency: {
      type: String,
      enum: [
        "Normal - Stable condition",
        "Priority - Needs quicker assistance",
        "Emergency - Life-threatening, immediate action required",
      ],
      required: true,
      trim: true,
    },
    distance: String,
    duration: String,
    amount: String,
    bookingId: { type: String, required: true, unique: true },
    status: { type: String, default: "searching" },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndividualDriver"
    },
    otp: { type: String },
    driverType: { type: String, enum: ["IndependentDriver", "PartnerDriver"], default: "IndependentDriver" },
    reassignedPartnerNames: [String],
    rejectionType: {
      type: String,
      enum: ["auto", "manual"],
      trim: true
    },
    numberOfAmbulancesRequested: { type: Number, default: 1 },
    remainingAmbulances: {
      type: Number,
      default: 0,
    },
    assignedAmbulances: [{
      driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerDriver' },
      partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
      name: String,
      phone: String,
      otp: String,
      driverType: { type: String, default: "PartnerDriver" },
      assignedAt: { type: Date, default: Date.now },
      plateNumber: String,
      status: {
        type: String,
        enum: ['assigned', 'en route', 'arrived', 'cancelled'],
        default: 'assigned'
      }
    }],
    reassignedPartners: [
      {
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
        assignedCount: { type: Number, default: 1 },
      }
    ],
    reassignHistory: [
      {
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
        assignedCount: Number,
        timestamp: { type: Date, default: Date.now },
      }
    ],
    assignedDrivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "PartnerDriver" }],

  },
  { timestamps: true }
);

// Optional: Enable geospatial queries
ambulanceRequestSchema.index({ pickupLocation: "2dsphere" });
ambulanceRequestSchema.index({ dropLocation: "2dsphere" });

module.exports = mongoose.model("AmbulanceRequest", ambulanceRequestSchema);
