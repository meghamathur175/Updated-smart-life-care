const mongoose = require("mongoose");
const Partner = require("../models/PartnerModel")
const HospitalPartner = require("../models/HospitalPartner")
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
    console.log("AmbulanceType received in confirmRequest:", req.body.ambulanceType);

    const { partnerId, userId, userName, pickup, drop, urgency, ambulanceType } = req.body;

    // Step 1: Validate input
    if (!userId || !userName || !pickup || !drop || !urgency || !ambulanceType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Step 2: Check if partnerId is valid
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: "Invalid partner ID format." });
    }

    // Step 3: Fetch partner
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    // Step 4: Check for duplicate request
    const alreadyRequested = partner.pendingRequests.some(
      (req) =>
        req.userId.toString() === userId &&
        req.pickup === pickup &&
        req.drop === drop &&
        req.userName === userName
    );

    if (!Array.isArray(partner.pendingRequests)) {
      partner.pendingRequests = [];
    }

    if (alreadyRequested) {
      return res.status(400).json({
        status: "fail",
        message: "Request already exists for this pickup and drop location.",
      });
    }

    const request = {
      userId,
      userName: userName?.trim(),
      partnerId,
      pickup: pickup?.trim(),
      drop: drop?.trim(),
      urgency,
      ambulanceType,
      status: "requested",
      timestamp: new Date(),
    };

    partner.pendingRequests = partner.pendingRequests.filter(req =>
      req.userId && req.userName && req.pickup && req.drop && req.urgency && req.ambulanceType
    );

    console.log("🛠 Final Request being added:", request);

    // Step 6: Add the new request
    partner.pendingRequests.push(request);

    partner.markModified("pendingRequests");

    // Step 7: Save updated partner
    await partner.save();

    // Step 8: Respond
    res.status(200).json({
      status: "success",
      message: "Request sent to partner successfully.",
      data: partner.pendingRequests,
    });

  } catch (error) {
    console.error("Error confirming request:", error);
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
          });
        }
      });
    }

    const grouped = {};

    allRequests.forEach((req) => {
      if (!grouped[req.date]) {
        grouped[req.date] = { date: req.date, trips: 0, accepted: 0, rejected: 0 };
      }

      grouped[req.date].trips += 1;

      if (req.status === "accepted") grouped[req.date].accepted += 1;
      else if (req.status === "rejected") grouped[req.date].rejected += 1;
    });

    const reports = Object.values(grouped);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports for partner:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
