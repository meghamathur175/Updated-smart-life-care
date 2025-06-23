const express = require("express");
const router = express.Router();
const { getRequestStatusByBookingId } = require("../controllers/getRequestStatusByBookingId");

router.get("/request-status/booking-id/:bookingId", getRequestStatusByBookingId);

module.exports = router;
