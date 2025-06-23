const express = require("express");
const router = express.Router();
const {
  getAllPartnerDrivers,
  registerPartnerDriver,
  getPartnerDriversByPartnerId,
  updatePartnerDriver,
  deletePartnerDriver,
  assignDriverToRequest,
} = require("../controllers/partnerDriverController");

router.get("/", getAllPartnerDrivers);
router.post("/", registerPartnerDriver);
router.get("/by-partner", getPartnerDriversByPartnerId);
router.put("/:id", updatePartnerDriver);
router.delete("/:id", deletePartnerDriver);
router.post("/assign-driver", assignDriverToRequest); 

module.exports = router;
