const mongoose = require("mongoose");
const Partner = require("../models/PartnerModel")
const PartnerDriver = require("../models/PartnerDriver")
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

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
    console.log("Inside add Partner");
    // console.log("Submitting Partner Data:", req.body);

    const { name, address, serviceAreas, commission, hospitalPlaceId, email } = req.body;

    // Validate inputs
    if (!name || !address || !serviceAreas || commission == null || !hospitalPlaceId || !email) {
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

    // Convert address to coordinates using Google Maps Geocoding API
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

    const geoRes = await axios.get(geoUrl);
    const geoData = geoRes.data;

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(400).json({ message: "Invalid address. Could not find coordinates." });
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // Create new partner (without password yet)
    const newPartner = new Partner({
      name: name.trim(),
      hospitalPlaceId: hospitalPlaceId.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      serviceAreas: serviceAreas.trim(),
      commission: Number(commission),
      password: null,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      }
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

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Step 1: Convert pickup address to coordinates
const getCoordinatesFromAddress = async (address) => {
  try {
    const res = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address,
        key: GOOGLE_API_KEY,
      },
    });

    console.log("getCoordinateFromAddress response: ", res.data);
    const location = res.data.results[0]?.geometry?.location;
    return location ? [location.lng, location.lat] : null;
  } catch (error) {
    console.error("❌ Failed to geocode address:", error.message);
    return null;
  }
};

// POST: Confirm request to partner
exports.confirmRequestToPartner = async (req, res) => {
  try {
    console.log("confirmRequestToPartner -> req.body:", req.body);
    // console.log("AmbulanceType received in confirmRequest:", req.body.ambulanceType);

    const { partnerId, userId, userName, pickup, drop, urgency, ambulanceType, ambulanceCost, pickupDistanceKm } = req.body;

    // Step 1: Validate input
    if (!userId || !userName || !pickup || !drop || !urgency || !ambulanceType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Step 2: Convert pickup to coordinates
    const pickupCoordinates = await getCoordinatesFromAddress(pickup);
    if (!pickupCoordinates) {
      return res.status(400).json({ message: "Invalid pickup address" });
    }

    // Step 3: Find nearest available partner (within 10 km radius)
    const nearestPartner = await Partner.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: pickupCoordinates },
          distanceField: "distance",
          spherical: true,
          maxDistance: 10 * 1000,
        }
      },
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(partnerId) }
        }
      },
      { $limit: 1 }
    ])

    if (!nearestPartner.length) {
      return res.status(404).json({ message: "No nearby hospital partners found" });
    }

    // Step 4: Validate partnerId
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: "Invalid partner ID format." });
    }

    // Step 5: Fetch the partner
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    // Step 6: Check for duplicate request
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

    // Step 7: Generate OTP & Booking
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingId = `REQ-${uuidv4()}`;

    // Step 8: Prepare the request object 
    // console.log("Booking ID: ", bookingId);

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
      otp,
      status: "requested",
      timestamp: new Date(),
      bookingId,
      pickupDistanceKm,
      distance: +(nearestPartner[0].distance / 1000).toFixed(2), // in km
      reassignedPartners: [partner._id],
    };

    // console.log("REQUEST PartnerController: ", request);

    // Step 9: Clean pendingRequests and add new one
    if (!Array.isArray(partner.pendingRequests)) {
      partner.pendingRequests = [];
    }

    partner.pendingRequests = partner.pendingRequests.filter(req =>
      req.userId && req.userName && req.pickup && req.drop
    );

    partner.pendingRequests.push(request);
    partner.markModified("pendingRequests");

    // Step 10: Save the updated partner  
    await partner.save();

    // Step 11: Respond with success
    res.status(200).json({
      status: "success",
      message: "request saved successfully.",
      request,
      bookingId: request.bookingId,
      assignedNearByPartner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        distance: request.distance,
      },
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

exports.rejectAndTransferRequest = async (req, res) => {
  try {
    console.log("Received rejection body:", req.body);

    const { partnerId, bookingId, pickup, reassignedPartners = [] } = req.body;
    const updatedReassignedPartners = [...reassignedPartners, partnerId];

    if (!partnerId || !bookingId || !pickup) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(404).json({ message: "Partner not found." });

    // Find the original request
    const request = partner.pendingRequests.find((r) => r.bookingId === bookingId);
    if (!request) return res.status(404).json({ message: "Request not found in partner." });

    // Mark original request as rejected (do not remove)
    request.status = "rejected & reassigned";
    partner.markModified("pendingRequests");
    await partner.save();

    // Convert pickup to coordinates
    const pickupCoordinates = await getCoordinatesFromAddress(pickup);
    if (!pickupCoordinates)
      return res.status(400).json({ message: "Invalid pickup address" });

    // Find a nearby hospital partner (exclude current)
    const nearbyPartners = await Partner.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: pickupCoordinates },
          distanceField: "distance",
          spherical: true,
          maxDistance: 10 * 1000,
        },
      },
      {
        $match: {
          _id: { $nin: updatedReassignedPartners.map(id => new mongoose.Types.ObjectId(id)) },
        },
      },
      { $limit: 1 },
    ]);

    if (!nearbyPartners.length) {
      return res.status(404).json({ message: "No other nearby hospitals available." });
    }

    console.log("NearBy Hospitals in RATR: ", nearbyPartners);

    const newPartner = await Partner.findById(nearbyPartners[0]._id);

    // Prepare new request copy for reassignment
    const originalRequestData = typeof request.toObject === "function" ? request.toObject() : { ...request };

    const reassignedRequest = {
      ...originalRequestData,
      partnerId: newPartner._id,
      status: "reassigned",
      distance: +(nearbyPartners[0].distance / 1000).toFixed(2),
      timestamp: new Date(),
      reassignedPartners: updatedReassignedPartners,
    };

    if (!Array.isArray(newPartner.pendingRequests)) {
      newPartner.pendingRequests = [];
    }

    newPartner.pendingRequests.push(reassignedRequest);
    newPartner.markModified("pendingRequests");
    await newPartner.save();

    console.log("🚀 Reassigned To:", {
      id: newPartner._id,
      name: newPartner.name,
      distance: reassignedRequest.distance,
    });

    res.status(200).json({
      message: "Request rejected and reassigned to nearby hospital.",
      reassignedTo: {
        id: newPartner._id,
        name: newPartner.name,
        distance: reassignedRequest.distance,
      },
    });
  } catch (error) {
    console.error("❌ Error in rejectAndTransferRequest:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    // console.log("REquest in getPartnerRequests: ", requests);
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

      if (req.status.toLowerCase() === "accepted" || req.status.toLowerCase() === "assigned") {
        grouped[req.date].accepted += 1;
        grouped[req.date].revenue += (partner.commission / 100) * req.cost;
      }

      else if (req.status.toLowerCase() === "rejected" || req.status.toLowerCase() === "rejected & reassigned") grouped[req.date].rejected += 1;
    });

    const reports = Object.values(grouped);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports for partner:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
