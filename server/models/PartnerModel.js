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
        ambulanceCost: {
          type: Number,
          default: 0
        },
        status: {
          type: String, default: "requested",
          trim: true,
          lowercase: true
        },
        timestamp: {
          type: Date,
          default: Date.now,
          trim: true
        },
        localDate: {
          type: String,
          trim: true
        },
        bookingId: String,
        distance: {
          type: Number,
          min: 0
        },
        reassignedPartners: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Partner'
        }],
        reassignedPartnerNames: [String],
        rejectedByPartnerName: {
          type: String,
          trim: true
        },
        rejectionType: {
          type: String, enum: ["auto", "manual"],
          trim: true
        },
        assignedDriverId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'pendingRequests.driverType',
          default: null
        },
        driverType: {
          type: String,
          enum: ['PartnerDriver', 'IndependentDriver'],
          default: null,
        },
        ambulancePlateNumber: {
          type: String,
          default: null
        },
        driverName: {
          type: String,
          trim: true,
          default: null
        },
        phone: {
          type: String,
          trim: true,
          default: null
        },
        otp: {
          type: String,
          trim: true,
          default: null
        },
        assignedAmbulances: [{
          driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerDriver' },
          partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
          assignedAt: { type: Date, default: Date.now },
          plateNumber: String,
          status: {
            type: String,
            enum: ['assigned', 'en route', 'arrived', 'cancelled'],
            default: 'assigned'
          },
        }],
        assignedAmbulancesByThisPartner: [{
          driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerDriver' },
          partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
          assignedAt: { type: Date, default: Date.now },
          plateNumber: String,
          status: {
            type: String,
            enum: ['assigned', 'en route', 'arrived', 'cancelled'],
            default: 'assigned'
          },
        }],
        numberOfAmbulancesRequested: { type: Number, default: 1 },
        remainingAmbulances: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
partnerSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Partner", partnerSchema);