const mongoose = require("mongoose");

const driverAuthSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    age: { type: Number, required: true },
    vehicleType: {
      type: String,
      required: true,
      enum: [
        "Basic Life Support (No oxygen cylinder)",
        "Advanced Life Support (With oxygen, medical equipment, trained staff)",
        "Critical Care Ambulance(Ambulance with doctor)",
      ],
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    isAvailable: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["offline", "online", "busy"],
      default: "offline",
    },
    ambulancePlateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, 
      trim: true,
    },
  },
  { timestamps: true }
);

driverAuthSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Driver", driverAuthSchema);