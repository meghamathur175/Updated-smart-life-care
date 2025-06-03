const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hospitalPlaceId: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    serviceAreas: { type: String, required: true },
    commission: { type: Number, required: true, min: 3, max: 5 },

    pendingRequests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
        pickup: { type: String, required: true },
        drop: { type: String, required: true },
        status: { type: String, default: "requested" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partner", partnerSchema);

