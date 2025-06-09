  const express = require("express");
  const dotenv = require("dotenv");
  const cors = require("cors");
  const Razorpay = require("razorpay");

  // Load environment variables
  dotenv.config(); 
  const app = express();

  // Load DB connection
  const connectDB = require("./config/database");

  // Middleware
  app.use(express.json()); // Parse incoming JSON

  // CORS setup
  app.use(
    cors({
      origin: process.env.FRONTEND_URI || "*", // Allow frontend access
      credentials: true,
    })
  );

  // Connect to MongoDB
  connectDB();

  // Load routes
  const userRoutes = require("./routes/userRoutes");
  const adminRoutes = require('./routes/adminRoutes'); 
  const partnerRoutes = require("./routes/partnerRoutes");
  const hospitalPartnerRoutes = require("./routes/hospitalPartnerRoutes");
  const partnerDriverRoutes = require("./routes/partnerDriverRoutes");
  const driverRoutes = require("./routes/driverRoutes"); // Driver auth routes
  const paymentRoutes = require("./routes/paymentRoutes");

  // API Routes
  app.use("/api/users", userRoutes); // User routes
  app.use('/api/admin', adminRoutes);
  app.use("/api/partners", partnerRoutes); // Partner routes
  app.use("/api/partners-register", hospitalPartnerRoutes); 
  app.use("/api/partner-drivers", partnerDriverRoutes); // Partner-managed drivers
  app.use("/api/drivers", driverRoutes); // Driver auth routes
  app.use("/api/v1", paymentRoutes); // Razorpay payment routes


  // Razorpay instance
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });

  module.exports = instance;

  // Server start
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
