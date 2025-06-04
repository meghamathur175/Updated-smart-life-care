const PartnerDriver = require("../models/PartnerDriver");

// GET: Get all partner drivers
exports.getAllPartnerDrivers = async (req, res) => {
  try {
    const drivers = await PartnerDriver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST: Register new partner driver
exports.addPartnerDriver = async (req, res) => {
  try {
    const { hospitalName, name, phone, address, vehicleType } = req.body;

    // Basic validation
    if (!hospitalName || !name || !phone || !address || !vehicleType) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newPartnerDriver = new PartnerDriver({
      hospitalName,
      name,
      phone,
      address,
      vehicleType,
    });

    await newPartnerDriver.save();
    res.status(201).json(newPartnerDriver);
  } catch (error) {
    res.status(400).json({
      message: "Failed to register partner driver",
      error: error.message,
    });
  }
};

// PUT: Update partner driver by ID
exports.updatePartnerDriver = async (req, res) => {
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

// DELETE: Remove a partner driver
exports.deletePartnerDriver = async (req, res) => {
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
