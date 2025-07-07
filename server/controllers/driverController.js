const Partner = require("../models/PartnerModel");
const PartnerDriver = require("../models/PartnerDriverModel");
const Driver = require("../models/IndividualDriverModel");

// NEW: Get assigned trip for a driver
const getAssignedTrip = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Use Individual Driver model
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Find a request assigned to this driver
    const partner = await Partner.findOne({ "pendingRequests.assignedDriverId": driverId });
    if (!partner) {
      return res.status(404).json({ message: "No assigned request" });
    }

    const request = partner.pendingRequests.find(
      (req) => req.assignedDriverId?.toString() === driverId
    );

    if (!request) {
      return res.status(404).json({ message: "Assigned request not found" });
    }

    res.status(200).json({
      request,
      driver: {
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        ambulancePlateNumber: driver.ambulancePlateNumber,
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

const updateDriverStatus = async (req, res) => {
  const { driverId, status } = req.body;

  if (!driverId || !["online", "offline", "busy"].includes(status)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  await Driver.findByIdAndUpdate(driverId, { status });

  res.status(200).json({ message: "Status updated" });
};

module.exports = {
  getAssignedTrip,
  updateDriverLocation,
  updateDriverStatus,
};