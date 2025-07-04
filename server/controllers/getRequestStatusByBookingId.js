const Partner = require("../models/PartnerModel");
const PartnerDriver = require("../models/PartnerDriverModel");

exports.getRequestStatusByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.bookingId?.trim();

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    // Efficient query: Find latest partner with matching request
    const partnerList = await Partner.find(
      { "pendingRequests.bookingId": bookingId },
      {
        name: 1,
        updatedAt: 1,
        pendingRequests: { $elemMatch: { bookingId } }
      }
    ).sort({ updatedAt: -1 });

    const partner = partnerList?.[0];

    // Safety fallback if not found
    if (!partner || !partner.pendingRequests?.length) {
      return res.status(404).json({ message: "No request found for the given booking ID." });
    }

    const request = partner.pendingRequests[0];

    if (!request) {
      return res.status(404).json({ message: "Request exists in partner but not found in pendingRequests." });
    }

    // Default response values
    let driverName = "Unavailable";
    let ambulancePlateNumber = "Unavailable";
    let otp = "0000";
    let phone = "000-000-0000";
    let finalStatus = request.status || "Pending";
    let hospitalName = partner.name;

    // If assigned, fetch driver info
    if (finalStatus.toLowerCase() === "assigned") {
      const assignedDriver = await PartnerDriver.findOne({ assignedRequestId: bookingId });

      if (assignedDriver) {
        driverName = assignedDriver.name || driverName;
        ambulancePlateNumber = assignedDriver.ambulancePlateNumber || ambulancePlateNumber;
        otp = assignedDriver.otp || otp;
        phone = assignedDriver.phone || phone;
        finalStatus = "Assigned";
      } else {
        finalStatus = "Searching";
      }
    }

    // Final response
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
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
