const express = require("express");
const router = express.Router();

const {
  getAllPartnerDrivers,
  registerPartnerDriver,
  getPartnerDriversByPartnerId,
  updatePartnerDriver,
  deletePartnerDriver,
  assignDriverToRequest,
  assignMultipleAmbulances,
} = require("../controllers/partnerDriverController");

const PartnerDriver = require("../models/PartnerDriverModel");
const AmbulanceRequest = require("../models/AmbulanceRequestModel");  

// Controller-based Routes
router.get("/", getAllPartnerDrivers);
router.post("/", registerPartnerDriver);
router.get("/by-partner", getPartnerDriversByPartnerId);
router.put("/:id", updatePartnerDriver);
router.delete("/:id", deletePartnerDriver);
router.post("/assign-driver", assignDriverToRequest);
router.post("/assign-multiple-ambulances", assignMultipleAmbulances);

// New route to get assigned ambulance request for a driver
router.get("/assigned-request/:driverId", async (req, res) => {
  try {
    const driverId = req.params.driverId;

    const driver = await PartnerDriver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedRequestId) {
      return res.status(200).json({ message: "No assigned request", assignedRequest: null });
    }

    const assignedRequest = await AmbulanceRequest.findById(driver.assignedRequestId);
    if (!assignedRequest) {
      return res.status(404).json({ message: "Assigned ambulance request not found" });
    }

    return res.status(200).json({ assignedRequest });
  } catch (error) {
    console.error("Error fetching assigned request:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
