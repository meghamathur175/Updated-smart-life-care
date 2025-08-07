const express = require("express");
const router = express.Router();
const {
  registerAgency,
  loginAgency,
  getAllAgencies,
  verifyAgency,
  toggleAgencyActiveStatus,
} = require("../controllers/agencyRegisterController");

// Routes for agency registration and management
router.post("/agencyregister/register", registerAgency);
router.post("/agencyregister/login", loginAgency);
router.get("/agencyregister", getAllAgencies);
router.put("/agencyregister/:id/verify", verifyAgency);
router.put("/agencyregister/:id/activate", toggleAgencyActiveStatus);

module.exports = router;
