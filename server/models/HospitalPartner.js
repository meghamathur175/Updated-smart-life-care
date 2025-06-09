// const mongoose = require("mongoose");

// const hospitalPartnerSchema = new mongoose.Schema(
//   {
//     hospitalName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     hospitalPhone: {
//       type: String,
//       required: true,
//       unique: true,
//       match: [/^\d{10}$/, "Phone number must be 10 digits"],
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       match: [
//         /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
//         "Email must be a valid Gmail address",
//       ],
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("HospitalPartner", hospitalPartnerSchema);

// models/HospitalPartner.js
const mongoose = require("mongoose");

const hospitalPartnerSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    hospitalPhone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
        "Email must be a valid Gmail address",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HospitalPartner", hospitalPartnerSchema);
