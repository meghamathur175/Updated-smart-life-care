const express = require("express");
const router = express.Router();
const {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} = require("../controllers/driverOnboardingController");

router.get("/", getAllDrivers);
router.post("/", createDriver);
router.put("/:id", updateDriver);
router.delete("/:id", deleteDriver);

module.exports = router;
