const express = require("express");
const { verifyPartner } = require("../middleware/partnerVerification");

const {
  selfRegisterHospitalPartner,
  loginHospitalPartner,
  logoutHospitalPartner,
  forgotPasswordHospitalPartner,
  resetPasswordHospitalPartner,
  getAllHospitalPartners,
  getLoggedInHospitalPartner,
} = require("../controllers/hospitalPartnerController");

const router = express.Router();

// Public routes
router.post("/self-register", selfRegisterHospitalPartner);
router.post("/login", loginHospitalPartner);
router.post("/logout", logoutHospitalPartner);
router.post("/forgot-password", forgotPasswordHospitalPartner);
router.post("/reset-password/:token", resetPasswordHospitalPartner);
router.get("/all", getAllHospitalPartners);

// Protected route
router.get("/me", verifyPartner, getLoggedInHospitalPartner);

module.exports = router;
