const express = require('express');
const router = express.Router();
const { processPayment, getKey } = require('../controllers/paymentController');

router.route("/payment/process").post(processPayment);
router.route("/getKey").get(getKey);

module.exports = router;