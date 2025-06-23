const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const Razorpay = require("razorpay");

// Load environment variables
dotenv.config();

// Create app
const app = express();

// Middleware
app.use(express.json()); // JSON body parser
app.use(
  cors({
    origin: process.env.FRONTEND_URI || "*",
    credentials: true,
  })
);

// Connect to DB
const connectDB = require("./config/database");
connectDB();

// Load Razorpay instance and export
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});
module.exports = razorpayInstance;

// Route Imports
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const hospitalPartnerRoutes = require("./routes/hospitalPartnerRoutes");
const partnerDriverRoutes = require("./routes/partnerDriverRoutes");
const driverRoutes = require("./routes/driverRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ambulanceTypeRoutes = require("./routes/ambulanceTypeRoutes");
const getRequestStatusRoutes = require("./routes/getRequestStatusByBookingIdRoutes");

// API Route Mounts
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/partners-register", hospitalPartnerRoutes);
app.use("/api/partner-drivers", partnerDriverRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", ambulanceTypeRoutes);
app.use("/api/partners", getRequestStatusRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found", url: req.originalUrl });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
