// controllers/getRequestStatusByBookingId.js

const Partner = require("../models/PartnerModel");
const PartnerDriver = require("../models/PartnerDriver");

// GET: Fetch driver assignment status by bookingId
exports.getRequestStatusByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.bookingId?.trim();
    console.log("📦 Booking ID Received:", bookingId);

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    const partner = await Partner.findOne({ "pendingRequests.bookingId": bookingId });

    if (!partner) {
      return res.status(404).json({ message: "No request found for the given booking ID." });
    }

    const request = partner.pendingRequests.find((r) => r.bookingId === bookingId);

    if (!request) {
      return res.status(404).json({ message: "Request exists in partner but not found in pendingRequests." });
    }

    // Default response values
    let driverName = "Unavailable";
    let ambulancePlateNumber = "Unavailable";
    let otp = "0000";
    let phone = "000-000-0000";
    let finalStatus = request.status || "Pending";

    // Only if driver is found, mark it as truly assigned
    if (request.status?.toLowerCase() === "assigned") {
      const assignedDriver = await PartnerDriver.findOne({ assignedRequestId: bookingId });
      console.log("🔍 Found assignedDriver:", assignedDriver);

      if (assignedDriver) {
        driverName = assignedDriver.name || driverName;
        ambulancePlateNumber = assignedDriver.ambulancePlateNumber || ambulancePlateNumber;
        otp = assignedDriver.otp || otp;
        phone = assignedDriver.phone || phone;
        console.log("Assigned Driver PHONE: ", assignedDriver.phone);
        console.log("Assigned Driver OTP: ", assignedDriver.otp);
        finalStatus = "Assigned";
      } else {
        // If driver not yet assigned, override status to prevent frontend confusion
        finalStatus = "Searching";
      }
    }

    return res.status(200).json({
      status: finalStatus,
      driverName,
      ambulancePlateNumber,
      otp,
      phone,
    });


  } catch (error) {
    console.error("❌ Error in getRequestStatusByBookingId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
