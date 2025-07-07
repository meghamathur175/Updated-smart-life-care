const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  date: { type: String, required: true },
  trips: Number,
  Accepted: Number,
  rejected: Number,
  revenue: Number,
  referrals: Number,
});

module.exports = mongoose.model("Report", reportSchema);
