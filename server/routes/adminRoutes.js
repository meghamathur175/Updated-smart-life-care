const express = require("express");
const router = express.Router();
const {
  getAdminReports,
} = require("../controllers/adminController");

router.get("/admin-reports", getAdminReports);

module.exports = router;
