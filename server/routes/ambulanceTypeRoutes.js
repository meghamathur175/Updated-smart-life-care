const express = require("express");
const router = express.Router();
const { getAmbulanceTypes } = require("../controllers/ambulanceTypeController");

router.get("/ambulance-types", getAmbulanceTypes);

module.exports = router;
