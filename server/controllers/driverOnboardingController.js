const axios = require("axios");
const Driver = require("../models/driverOnboardingModel"); // Ensure this model is created
const mongoose = require("mongoose");

// GET all drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch drivers", error: error.message });
  }
};

// POST - Add a new driver
const createDriver = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      ambulanceType,
      licenseNumber,
      commission,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !phone ||
      !email ||
      !address ||
      !ambulanceType ||
      !licenseNumber
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate phone format
    if (!/^[0-9]{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits." });
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate commission
    const commissionNum = Number(commission);
    if (commissionNum < 3 || commissionNum > 5) {
      return res
        .status(400)
        .json({ message: "Commission must be between 3% and 5%." });
    }

    // Geocode address
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${mapsApiKey}`;

    const geoResponse = await axios.get(geocodeUrl);
    const geoData = geoResponse.data;

    if (!geoData.results || geoData.results.length === 0) {
      return res
        .status(400)
        .json({ message: "Geocoding failed. Please check the address." });
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    const newDriver = new Driver({
      name,
      phone,
      email,
      address,
      ambulanceType,
      licenseNumber,
      commission: commissionNum,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    });

    await newDriver.save();
    res
      .status(201)
      .json({ message: "Driver added successfully", driver: newDriver });
  } catch (error) {
    console.error("Error creating driver:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT - Update driver
const updateDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (updateData.address) {
      // Geocode if address has changed
      const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        updateData.address
      )}&key=${mapsApiKey}`;

      const geoResponse = await axios.get(geocodeUrl);
      const geoData = geoResponse.data;

      if (!geoData.results || geoData.results.length === 0) {
        return res
          .status(400)
          .json({ message: "Geocoding failed. Please check the address." });
      }

      const { lat, lng } = geoData.results[0].geometry.location;
      updateData.location = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }

    const updatedDriver = await Driver.findByIdAndUpdate(driverId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Driver updated", driver: updatedDriver });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update driver", error: error.message });
  }
};

// DELETE - Remove driver
const deleteDriver = async (req, res) => {
  try {
    const driverId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    await Driver.findByIdAndDelete(driverId);
    res.status(200).json({ message: "Driver deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete driver", error: error.message });
  }
};

module.exports = {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
};
