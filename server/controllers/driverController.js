const Partner = require("../models/PartnerModel");
const PartnerDriver = require("../models/PartnerDriverModel");
const Driver = require("../models/IndividualDriverModel");

// NEW: Get assigned trip for a driver
const getAssignedTrip = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await PartnerDriver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (!driver.assignedRequestId) {
      return res.status(404).json({ message: "No assigned request" });
    }

    const partner = await Partner.findById(driver.partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    const request = partner.pendingRequests.find(
      (req) => req.bookingId === driver.assignedRequestId
    );

    if (!request) {
      return res.status(404).json({ message: "Assigned request not found" });
    }

    res.status(200).json({
      request,
      driver: {
        name: driver.name,
        phone: driver.phone,
        ambulancePlateNumber: driver.ambulancePlateNumber,
        otp: driver.otp,
      },
    });
  } catch (error) {
    console.error("Error fetching assigned trip:", error);
    res.status(500).json({
      message: "Server error while fetching assigned trip",
      error: error.message,
    });
  }
};

const updateDriverLocation = async (req, res) => {
  try {
    const { driverId, lng, lat } = req.body;

    if (!driverId || lng === undefined || lat === undefined) {
      return res.status(400).json({ message: "Missing driverId, lng, or lat" });
    }

    await Driver.findByIdAndUpdate(driverId, {
      location: { type: "Point", coordinates: [lng, lat] },
      isAvailable: true, // Optionally set available on location update
    });

    res.json({ message: "Location updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update location" });
  }
};

module.exports = {
  getAssignedTrip,
  updateDriverLocation,
};
