// const express = require("express");
// const router = express.Router();
// const {
//   registerDriver,
//   loginDriver,
//   logoutDriver,
//   forgotPasswordDriver,
//   resetPasswordDriver,
//   getAllDrivers,
// } = require("../controllers/driverAuthController");

// router.post("/register", registerDriver);
// router.post("/login", loginDriver);
// router.post("/driver-forgot-password", forgotPasswordDriver);
// router.post("/reset-password/:token", resetPasswordDriver);
// router.get("/logout", logoutDriver);
// router.get("/all", getAllDrivers);

// module.exports = router;

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
router.post("/reset-password/:token", resetPasswordDriver);
router.get("/logout", logoutDriver);
router.get("/all", getAllDrivers);

module.exports = router;
