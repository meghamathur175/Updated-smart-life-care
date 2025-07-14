const Partner = require("../models/PartnerModel");
const PartnerDriver = require("../models/PartnerDriverModel");
const Driver = require("../models/IndividualDriverModel");
const AmbulanceRequest = require("../models/AmbulanceRequestModel");
const { markPartnerRequestAsAssigned } = require("../controllers/partnerController");

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

// Accept request by individual driver
const acceptRequestByIndividualDriver = async (req, res) => {
  try {
    console.log("📥 Incoming accept request in driver controller acceptRequestByIndividualDriver:", req.body);

    const { driverId, bookingId } = req.body;

    if (!driverId || !bookingId) {
      return res.status(400).json({ message: "Missing driverId or bookingId" });
    }

    // Find the request by bookingId
    const request = await AmbulanceRequest.findOne({ bookingId });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status === "assigned") {
      return res.status(400).json({ message: "Request already assigned" });
    }

    // Assign the driver
    request.assignedDriver = driverId;
    request.status = "assigned_by_individual_driver";
    request.otp = Math.floor(1000 + Math.random() * 9000).toString();
    request.driverType = "IndependentDriver";
    request.acceptedAt = new Date();
    console.log("✅ Request after save:", request);

    // Update partner.pendingRequests status to "assigned"
    await markPartnerRequestAsAssigned(bookingId);

    // Optionally update driver status
    await Driver.findByIdAndUpdate(driverId, { status: "busy" });

    // Emit event to user if needed
    const driver = await Driver.findById(driverId);
    console.log("DRIVER IN acceptRequestByIndividualDriver: ", driver);
    
    if (driver) {
      request.driverName = `${driver.firstName} ${driver.lastName}`;
      request.phone = driver.phone;
      request.ambulancePlateNumber = driver.ambulancePlateNumber;
      request.driverType = "IndependentDriver";
    }
    
    global.io.to(request.socketId).emit("driver_assigned", {
      driverId,
      driverName: `${driver.firstName} ${driver.lastName}`,
      ambulancePlateNumber: driver.ambulancePlateNumber,
      phone: driver.phone,
      otp: request.otp,
      driverType: "IndependentDriver",
      status: "assigned_by_individual_driver"
    });
    
    await request.save(); // Now all fields including driver details will be stored

    res.status(200).json({ message: "Driver assigned successfully" });
  } catch (error) {
    console.error("❌ acceptRequest error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAssignedTrip,
  updateDriverLocation,
  updateDriverStatus,
  acceptRequestByIndividualDriver,
};