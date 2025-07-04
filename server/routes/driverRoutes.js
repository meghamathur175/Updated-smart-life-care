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
 } = require("../controllers/driverController");

router.post("/register", registerDriver);
router.post("/login", loginDriver);
router.post("/forgot-password", forgotPasswordDriver);
router.post("/driver-reset-password/:token", resetPasswordDriver);
router.get("/logout", logoutDriver);
router.get("/all", getAllDrivers);


router.get("/assigned-trip/:driverId", getAssignedTrip);

router.post("/update-location", updateDriverLocation);
module.exports = router;
