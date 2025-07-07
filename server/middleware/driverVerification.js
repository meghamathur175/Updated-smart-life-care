const jwt = require("jsonwebtoken");
const Driver = require("../models/driverModel");

const authDriver = async (req, res, next) => {
  try {
    // Get token from Authorization header
    let token = req.header("Authorization");

    // Optional: Support for Bearer tokens
    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.KEY);

    // Find driver from token payload (_id)
    const driver = await Driver.findById(decoded._id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }

    // Attach driver to request
    req.driver = driver;

    next();
  } catch (err) {
    console.error("Driver token verification error:", err.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = {
  authDriver
};
