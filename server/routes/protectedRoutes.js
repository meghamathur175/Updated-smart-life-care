const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

router.get("/partners", verifyToken, async (req, res) => {
  // Your protected logic here
  res.json({ message: "Protected route accessed", user: req.user });
});

module.exports = router;
