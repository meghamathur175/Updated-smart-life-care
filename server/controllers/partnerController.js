const mongoose = require("mongoose");
const Partner = require("../models/PartnerModel")
const PartnerDriver = require("../models/PartnerDriver")
const jwt = require("jsonwebtoken");

// GET: Get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find();
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST: Add new partner
exports.addPartner = async (req, res) => {
  try {
    // console.log("Inside add Partner");
    // console.log("Submitting Partner Data:", req.body);

    const { name, location, serviceAreas, commission, hospitalPlaceId, email } = req.body;

    // Validate inputs
    if (!name || !location || !serviceAreas || commission == null || !hospitalPlaceId || !email) {
      return res.status(400).json({ message: "All fields are required, including email and hospitalPlaceId." });
    }

    // Check if a partner already exists for this hospital
    const existingHospitalPartner = await Partner.findOne({ hospitalPlaceId });
    if (existingHospitalPartner) {
      return res.status(400).json({ message: "Partner already exists for this hospital." });
    }

    // Check if email is already used
    const existingEmail = await Partner.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already associated with another partner." });
    }

    // Trim values
    const trimmedPlaceId = hospitalPlaceId.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Create new partner (without password yet)
    const newPartner = new Partner({
      name,
      location,
      serviceAreas,
      commission,
      hospitalPlaceId: trimmedPlaceId,
      email: trimmedEmail,
      password: null,
    });

    // Save partner
    await newPartner.save();

    res.status(201).json({
      status: "success",
      message: "Partner added successfully. They can now register using this email.",
      data: newPartner,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add partner",
      error: error.message,
    });
  }
};

// PUT: Update existing partner
exports.updatePartner = async (req, res) => {
  try {
    const partnerId = req.params.id;
    const updatedData = req.body;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    const updatedPartner = await Partner.findByIdAndUpdate(
      partnerId,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedPartner);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update partner", error: error.message });
  }
};

// DELETE: Delete existing partner
exports.deletePartner = async (req, res) => {
  try {
    const partnerId = req.params.id;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    await Partner.findByIdAndDelete(partnerId);
    res.status(200).json({ message: "Partner deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete partner", error: error.message });
  }
};

exports.getPartnerByHospitalPlaceId = async (req, res) => {
  const { place_id } = req.params;

  try {
    const trimmedPlaceId = place_id.trim();
    const partner = await Partner.findOne({ hospitalPlaceId: trimmedPlaceId });

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Return partner ID
    res.json({ partnerId: partner._id });
  } catch (error) {
    console.error("Error fetching partner by hospital place_id:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST: Confirm request to partner
exports.confirmRequestToPartner = async (req, res) => {
  try {
    console.log("confirmRequestToPartner -> req.body:", req.body);
    // console.log("AmbulanceType received in confirmRequest:", req.body.ambulanceType);

    const { partnerId, userId, userName, pickup, drop, urgency, ambulanceType, ambulanceCost, } = req.body;

    // Step 1: Validate input
    if (!userId || !userName || !pickup || !drop || !urgency || !ambulanceType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Step 2: Validate partnerId
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: "Invalid partner ID format." });
    }

    // Step 3: Fetch the partner
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    // Step 4: Check for duplicate request
    const alreadyRequested = partner.pendingRequests?.some(
      (req) =>
        req.userId.toString() === userId &&
        req.pickup.trim().toLowerCase() === pickup.trim().toLowerCase() &&
        req.drop.trim().toLowerCase() === drop.trim().toLowerCase() &&
        req.userName === userName
    );

    if (alreadyRequested) {
      return res.status(400).json({
        status: "fail",
        message: "Request already exists for this pickup and drop location.",
      });
    }

    // Step 5: Find available driver from this partner

    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "").trim();

    const allDrivers = await PartnerDriver.find({ partnerId: partner._id });
    console.log("All drivers:", allDrivers.map(d => ({ name: d.name, available: d.available, vehicleType: d.vehicleType })));

    const driver = allDrivers.find(d => {
      return d.available && normalize(d.vehicleType) === normalize(ambulanceType);
    });


    console.log("🚑 Driver found:", driver);

    if (!driver) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      const bookingId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const request = {
        userId,
        userName: userName?.trim(),
        partnerId: partner._id,
        pickup: pickup?.trim(),
        drop: drop?.trim(),
        urgency,
        ambulanceType,
        ambulanceCost: ambulanceCost || 0,
        ambulancePlateNumber: null,
        driverId: null,
        driver: null,
        otp,
        status: "Pending",
        timestamp: new Date(),
        bookingId,
      };

      if (!Array.isArray(partner.pendingRequests)) {
        partner.pendingRequests = [];
      }

      partner.pendingRequests.push(request);
      partner.markModified("pendingRequests");
      await partner.save();

      return res.status(200).json({
        status: "pending",
        message: "No driver available. Request is pending.",
        request,
        otp,
        bookingId: request.bookingId,
      });
    }

    // Step 6: Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Step 7: Prepare the request object 
    const bookingId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const request = {
      userId,
      userName: userName?.trim(),
      partnerId: partner._id,
      pickup: pickup?.trim(),
      drop: drop?.trim(),
      urgency,
      ambulanceType,
      ambulanceCost: ambulanceCost || 0,
      ambulancePlateNumber: driver.ambulancePlateNumber,
      driverId: driver._id,
      driver: {
        name: driver.name,
        plate: driver.ambulancePlateNumber,
        phone: driver.phone,         
        otp: otp
      },
      driverName: driver.name,
      otp,
      status: "Assigned",
      timestamp: new Date(),
      bookingId,
    };

    // Step 8: Mark driver unavailable
    driver.available = false;
    driver.status = "unavailable";
    driver.assignedRequestId = bookingId;
    await driver.save();

    // Step 9: Clean pendingRequests and add new one
    if (!Array.isArray(partner.pendingRequests)) {
      partner.pendingRequests = [];
    }

    partner.pendingRequests = partner.pendingRequests.filter(req =>
      req.userId && req.userName && req.pickup && req.drop && req.urgency && req.ambulanceType && req.otp
    );


    partner.pendingRequests.push(request);
    partner.markModified("pendingRequests");

    // Step 10: Save the updated partner  
    await partner.save();

    // Step 11: Respond with success + driver info
    res.status(200).json({
      status: "success",
      message: "Driver assigned and request saved successfully.",
      request,
      driver: {
        name: driver.name,
        phone: driver.phone,
        plate: driver.ambulancePlateNumber,
        otp,
      },
      bookingId: request.bookingId,
    });

  } catch (error) {
    console.error("❌ Error in confirmRequestToPartner:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getPartnerRequests = async (req, res) => {
  try {
    const partnerId = req.partnerId

    if (!partnerId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const partner = await Partner.findById(partnerId);

    if (!partner) {
      console.log("No partner found for ID:", partnerId);
      return res.status(404).json({ message: "Partner not found" });
    }

    const requests = partner?.pendingRequests || [];
    res.status(200).json(requests);

  } catch (err) {
    console.error("Error in getPartnerRequests:", err);
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { partnerId, requestId, newStatus } = req.body;
    if (!partnerId || !requestId || !newStatus) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    const request = partner.pendingRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    request.status = newStatus.toLowerCase();
    await partner.save();

    res.status(200).json({ message: "Request status updated.", request: partner.pendingRequests || [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to update request status.", error: error.message });
  }
};

exports.getPartnerById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid partner ID" });
  }

  try {
    const partner = await Partner.findById(id);
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET: Generate report summary (daily/weekly)
exports.getReports = async (req, res) => {
  try {
    const partnerId = req.params.id;

    const partner = await Partner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    const allRequests = [];

    if (Array.isArray(partner.pendingRequests)) {
      partner.pendingRequests.forEach((req) => {
        if (req.timestamp) {
          allRequests.push({
            date: req.timestamp.toISOString().split("T")[0],
            status: (req.status || "").toLowerCase(),
            cost: req.ambulanceCost || 0,
          });
        }
      });
    }

    const grouped = {};

    allRequests.forEach((req) => {
      if (!grouped[req.date]) {
        grouped[req.date] = { date: req.date, trips: 0, accepted: 0, rejected: 0, revenue: 0, };
      }

      grouped[req.date].trips += 1;

      if (req.status === "accepted" || req.status === "assigned") {
        grouped[req.date].accepted += 1;
        grouped[req.date].revenue += (partner.commission / 100) * req.cost;
      }

      else if (req.status === "rejected") grouped[req.date].rejected += 1;
    });

    const reports = Object.values(grouped);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports for partner:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const assignDriversToPendingRequests = async () => {
  try {
    const partners = await Partner.find({ pendingRequests: { $elemMatch: { status: "Pending" } } });

    for (const partner of partners) {
      let hasChanges = false;

      const updatedRequests = await Promise.all(
        partner.pendingRequests.map(async (req) => {
          if ((req.status || "").toLowerCase() !== "pending") return req;

          const driver = await PartnerDriver.findOne({
            partnerId: partner._id,
            available: true,
            status: "available",
            vehicleType: new RegExp(`^${req.ambulanceType}$`, "i"),
          });

          console.log("DRIVER assignDriversToPendingRequests: ", driver);
          if (driver) {
            const otp = Math.floor(1000 + Math.random() * 9000).toString(); 

            req.status = "Assigned";
            req.bookingId = req.bookingId || `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`; 
            req.ambulancePlateNumber = driver.ambulancePlateNumber;
            req.driverId = driver._id;
            req.driver = {
              name: driver.name,
              plate: driver.ambulancePlateNumber,
              phone: driver.phone,
              otp: otp
            };
            req.driverName = driver.name;
            req.otp = otp;

            // 🔒 Update driver
            driver.available = false;
            driver.status = "unavailable";
            driver.assignedRequestId = req.bookingId;
            driver.otp = otp;
            await driver.save();

            hasChanges = true;
            console.log(`✅ Assigned driver ${driver.name} to request for ${req.userName}`);
          }

          return req;
        })
      );

      if (hasChanges) {
        partner.markModified("pendingRequests"); 
        partner.pendingRequests = updatedRequests;
        await partner.save();
      }

    }
  } catch (err) {
    console.error("❌ Error assigning drivers to pending requests:", err.message);
  }
};

setInterval(assignDriversToPendingRequests, 1000);

const fixDriverStatusInconsistencies = async () => {
  const drivers = await PartnerDriver.find();

  for (const driver of drivers) {
    if (driver.available && driver.status !== "available") {
      driver.status = "available";
      await driver.save();
    } else if (!driver.available && driver.status !== "unavailable") {
      driver.status = "unavailable";
      await driver.save();
    }
  }
};

// Run this once on server start
fixDriverStatusInconsistencies();
