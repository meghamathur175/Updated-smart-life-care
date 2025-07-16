const mongoose = require("mongoose");
const PartnerDriver = require("../models/PartnerDriverModel");
const Partner = require("../models/PartnerModel");

// GET: All partner drivers (admin use only)
const getAllPartnerDrivers = async (req, res) => {
  try {
    const drivers = await PartnerDriver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST: Register new partner driver
const registerPartnerDriver = async (req, res) => {
  try {
    // console.log("📥 Incoming Partner Driver Data:", req.body);
    const { name, phone, address, vehicleType, partnerId, ambulancePlateNumber } = req.body;

    if (!name || !phone || !address || !vehicleType || !partnerId || !ambulancePlateNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newDriver = new PartnerDriver({
      name,
      phone,
      address,
      vehicleType,
      ambulancePlateNumber,
      partnerId,
    });

    await newDriver.save();

    res.status(201).json({
      message: "Driver registered successfully",
      driver: newDriver,
    });
  } catch (error) {
    console.error("Error registering driver:", error);
    res.status(500).json({
      message: "Server error while registering driver.",
      error: error.message,
    });
  }
};

// ✅ GET: Partner drivers by partner ID (for logged-in partner only)
const getPartnerDriversByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.query;

    if (!partnerId || !mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: "Missing or invalid partnerId" });
    }

    const drivers = await PartnerDriver.find({ partnerId });
    res.status(200).json({ drivers });
  } catch (error) {
    console.error("Error fetching drivers by partnerId:", error);
    res.status(500).json({
      message: "Server error while fetching drivers.",
      error: error.message,
    });
  }
};

// PUT: Update a partner driver
const updatePartnerDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    const updatedData = req.body;

    const driver = await PartnerDriver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Partner driver not found" });
    }

    const updatedDriver = await PartnerDriver.findByIdAndUpdate(
      driverId,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedDriver);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update partner driver",
      error: error.message,
    });
  }
};

// DELETE: Delete a partner driver
const deletePartnerDriver = async (req, res) => {
  try {
    const driverId = req.params.id;

    const driver = await PartnerDriver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Partner driver not found" });
    }

    await PartnerDriver.findByIdAndDelete(driverId);
    res.status(200).json({ message: "Partner driver deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete partner driver",
      error: error.message,
    });
  }
};

const assignDriverToRequest = async (req, res) => {
  try {
    const { partnerId, requestId, driverId } = req.body;
    console.log("Partner Driver Controller received req: ", req.body);

    if (!partnerId || !requestId || !driverId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(404).json({ message: "Partner not found" });

    const request = partner.pendingRequests.find((r) => r.bookingId === requestId);

    // console.log("REQUEST ASSIGN DRIVER: ", request);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const status = request.status?.toLowerCase();
    if (!status || !["accepted", "reassigned"].includes(status)) {
      return res.status(400).json({
        message: "Request must be in 'Accepted' or 'reassigned' status before assigning a driver."
      });
    }

    // Optional: if reassigned, check that this partner has Accepted it (for extra safety)
    if (status === "reassigned" && request.partnerId?.toString() !== partnerId) {
      return res.status(403).json({
        message: "This request was not reassigned to your hospital."
      });
    }

    const driver = await PartnerDriver.findById(driverId);
    console.log(driver, request);

    if (!driver || !driver.available) {
      return res.status(400).json({ message: "Driver not available or not found." });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // request
    request.status = "assigned";
    request.driverId = driver._id;
    request.ambulancePlateNumber = driver.ambulancePlateNumber;
    request.driver = {
      name: driver.name,
      plate: driver.ambulancePlateNumber,
      phone: driver.phone,
      otp,
    };
    request.otp = otp;

    console.log("Assign Driver Controller: ", request);
    // Update driver
    driver.available = false;
    driver.status = "unavailable";
    driver.assignedRequestId = request.bookingId;
    driver.otp = otp;

    await driver.save();
    await partner.save();

    return res.status(200).json({
      message: "Driver assigned successfully.",
      driver: {
        name: driver.name,
        phone: driver.phone,
        plate: driver.ambulancePlateNumber,
        otp,
      },
      request,
    });

  } catch (error) {
    console.error("❌ Error assigning driver:", error);
    res.status(500).json({
      message: "Server error while assigning driver.",
      error: error.message,
    });
  }
};



module.exports = {
  getAllPartnerDrivers,
  registerPartnerDriver,
  getPartnerDriversByPartnerId,
  updatePartnerDriver,
  deletePartnerDriver,
  assignDriverToRequest,
};
