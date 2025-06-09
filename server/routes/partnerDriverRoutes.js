// routes/partnerDrivers.js
const express = require("express");
const router = express.Router();
const partnerDriverController = require("../controllers/partnerDriverController");

router.get("/", partnerDriverController.getAllPartnerDrivers);
router.post("/", partnerDriverController.addPartnerDriver);
router.put("/:id", partnerDriverController.updatePartnerDriver);
router.delete("/:id", partnerDriverController.deletePartnerDriver);

module.exports = router;
