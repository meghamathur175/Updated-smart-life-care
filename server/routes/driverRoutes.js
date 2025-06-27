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

router.post("/register", registerDriver);
router.post("/login", loginDriver);
router.post("/forgot-password", forgotPasswordDriver);
router.post("/driver-reset-password/:token", resetPasswordDriver);
router.get("/logout", logoutDriver);
router.get("/all", getAllDrivers);

module.exports = router;
