const express = require("express");
const router = express.Router();
const {
  registerHospitalPartner,
  loginHospitalPartner,
  getAllHospitalPartners,
  verifyHospitalPartner,
  toggleHospitalActiveStatus,
} = require("../controllers/hospitalregisterController");

router.post("/hospitalregister/register", registerHospitalPartner);
router.post("/hospitalregister/login", loginHospitalPartner);
router.get("/hospitalregister", getAllHospitalPartners);
router.put("/hospitalregister/:id/verify", verifyHospitalPartner);
router.put("/hospitalregister/:id/activate", toggleHospitalActiveStatus);

module.exports = router;
