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
  res.status(
  ).json({ message: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found", url: req.originalUrl });
});


// --- SOCKET.IO SETUP ---

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URI,
    // origin: "*",
    credentials: true,
  },
});

// Store driver sockets
const driverSockets = new Map();

// Models for accept_request logic
const Partner = require("./models/PartnerModel");
const Driver = require("./models/IndividualDriverModel");

io.on("connection", (socket) => {
  // Driver registers their ID after login
  socket.on("register_driver", (driverId) => {
    console.log("Driver registered:", driverId, "Socket:", socket.id);
    driverSockets.set(driverId, socket.id);
    socket.join(driverId); // Optional: join a room for this driver
  });

  // Handle driver disconnect
  socket.on("disconnect", () => {
    for (const [driverId, sockId] of driverSockets.entries()) {
      if (sockId === socket.id) {
        driverSockets.delete(driverId);
        break;
      }
    }
  });

  // Handle driver accept request
  socket.on("accept_request", async ({ requestId, driverId }) => {
    try {
      const partner = await Partner.findOne({ "pendingRequests.bookingId": requestId });
      if (!partner) return;

      const request = partner.pendingRequests.find(r => r.bookingId === requestId);

      if (request && !request.assignedDriverId) {
        request.assignedDriverId = driverId;
        request.status = "assigned_by_individual_driver";
        partner.markModified("pendingRequests");
        await partner.save();

        await Driver.findByIdAndUpdate(driverId, { isAvailable: false });

        // ✅ NEW: Update status in AmbulanceRequest model
        const AmbulanceRequest = require("./models/AmbulanceRequestModel");
        await AmbulanceRequest.findOneAndUpdate(
          { bookingId: requestId },
          {
            status: "assigned_by_individual_driver",
            driverType: "IndependentDriver",
            driverId: driverId,
            assignedAt: new Date(),
          },
          { new: true }
        );

        // Notify all drivers to close pop-up
        io.emit("request_taken", { requestId, driverId });
      }
    } catch (err) {
      console.error("Error in accept_request:", err);
    }
  });

});

// Make io and driverSockets available globally
global.io = io;
global.driverSockets = driverSockets;

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});