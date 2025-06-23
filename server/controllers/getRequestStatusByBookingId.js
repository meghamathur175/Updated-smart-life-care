const Partner = require("../models/PartnerModel");
const PartnerDriver = require("../models/PartnerDriver");

exports.getRequestStatusByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.bookingId?.trim();

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    // Find the current partner (hospital) handling this request
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

    // Track hospital name (new reassigned hospital)
    let hospitalName = partner.name;

    // Handle reassigned driver
    if (finalStatus.toLowerCase() === "assigned") {
      const assignedDriver = await PartnerDriver.findOne({ assignedRequestId: bookingId });

      if (assignedDriver) {
        driverName = assignedDriver.name || driverName;
        ambulancePlateNumber = assignedDriver.ambulancePlateNumber || ambulancePlateNumber;
        otp = assignedDriver.otp || otp;
        phone = assignedDriver.phone || phone;

        finalStatus = "Assigned";
      } else {
        finalStatus = "Searching"; // Prevents frontend from thinking it's fully assigned
      }
    }

    // Respond with driver info + latest hospital name
    return res.status(200).json({
      status: finalStatus,
      driverName,
      ambulancePlateNumber,
      otp,
      phone,
      hospitalName
    });

  } catch (error) {
    console.error("❌ Error in getRequestStatusByBookingId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
