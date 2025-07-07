const express = require("express");
const router = express.Router();

const {
  forgotPasswordDriver,
  registerDriver,
  loginDriver,
  logoutDriver,
  resetPasswordDriver,
  getAllDrivers,
  
} = require("../controllers/driverAuthController");

const { 
  getAssignedTrip,
  updateDriverLocation,
  updateDriverStatus,
 } = require("../controllers/driverController");

router.post("/register", registerDriver);
router.post("/login", loginDriver);
router.post("/forgot-password", forgotPasswordDriver);
router.post("/driver-reset-password/:token", resetPasswordDriver);
router.get("/logout", logoutDriver);
router.get("/all", getAllDrivers);

router.get("/assigned-trip/:driverId", getAssignedTrip);
router.post("/update-location", updateDriverLocation);
router.post("/update-status", updateDriverStatus);

const Driver = require("../models/IndividualDriverModel");

router.get("/:driverId", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.status(200).json(driver);
  } catch (err) {
    res.status(500).json({ message: "Error fetching driver", error: err.message });
  }
});


module.exports = router;
