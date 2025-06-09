const express = require("express");
const {
  registerHospitalPartner,
  loginHospitalPartner,
  logoutHospitalPartner,
  forgotPasswordHospitalPartner,
  resetPasswordHospitalPartner,
  getAllHospitalPartners,
} = require("../controllers/hospitalPartnerController");

const router = express.Router();

router.post("/register", registerHospitalPartner);
router.post("/login", loginHospitalPartner);
router.post("/logout", logoutHospitalPartner);
router.post("/forgot-password", forgotPasswordHospitalPartner);
router.post("/reset-password/:token", resetPasswordHospitalPartner);
router.get("/all", getAllHospitalPartners);

module.exports = router;
