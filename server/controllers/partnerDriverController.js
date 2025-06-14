const mongoose = require("mongoose");
const PartnerDriver = require("../models/PartnerDriver");

// ✅ GET: All partner drivers (admin use only)
const getAllPartnerDrivers = async (req, res) => {
  try {
    const drivers = await PartnerDriver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ POST: Register new partner driver
const registerPartnerDriver = async (req, res) => {
  try {
    const { name, phone, address, vehicleType, partnerId } = req.body;

    if (!name || !phone || !address || !vehicleType || !partnerId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newDriver = new PartnerDriver({
      name,
      phone,
      address,
      vehicleType,
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

// ✅ PUT: Update a partner driver
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

// ✅ DELETE: Delete a partner driver
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

module.exports = {
  getAllPartnerDrivers,
  registerPartnerDriver,
  getPartnerDriversByPartnerId,
  updatePartnerDriver,
  deletePartnerDriver,
};
