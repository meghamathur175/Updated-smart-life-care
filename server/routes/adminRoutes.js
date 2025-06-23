const express = require("express");
const router = express.Router();
const {
  getAdminReports,
  getRevenueStats
} = require("../controllers/adminController");

router.get("/admin-reports", getAdminReports);
router.get("/revenue-stats", getRevenueStats);

module.exports = router;
