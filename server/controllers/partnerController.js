const mongoose = require("mongoose");
const Partner = require("../models/PartnerModel")
const Driver = require("../models/IndividualDriverModel");
const AmbulanceRequest = require("../models/AmbulanceRequestModel");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const IST = "Asia/Kolkata";

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

    const { partnerId, userId, userName, pickup, drop, urgency, ambulanceType, ambulanceCost, pickupDistanceKm, socketId, numberOfAmbulancesRequested, numberOfRemainingAmbulances } = req.body;

    // Step 1: Validate input
    if (!userId || !userName || !pickup || !drop || !urgency || !ambulanceType || numberOfAmbulancesRequested === undefined || numberOfAmbulancesRequested === null || numberOfRemainingAmbulances === undefined || numberOfRemainingAmbulances === null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Step 2: Convert pickup & drop to coordinates
    const pickupCoordinates = await getCoordinatesFromAddress(pickup);
    if (!pickupCoordinates) {
      return res.status(400).json({ message: "Invalid pickup address" });
    }

    const dropCoordinates = await getCoordinatesFromAddress(drop);
    if (!dropCoordinates) {
      return res.status(400).json({ message: "Invalid drop address" });
    }

    // Step 3: Validate partnerId
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: "Invalid partner ID format." });
    }

    // Step 4: Fetch the partner
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    // Step 5: Check for duplicate request
    const alreadyRequested = partner.pendingRequests?.some(
      (req) =>
        req.userId?.toString?.() === userId &&
        req.pickup?.trim?.().toLowerCase?.() === pickup.trim().toLowerCase() &&
        req.drop?.trim?.().toLowerCase?.() === drop.trim().toLowerCase() &&
        req.userName === userName
    );

    if (alreadyRequested) {
      return res.status(400).json({
        status: "fail",
        message: "Request already exists for this pickup and drop location.",
      });
    }

    // Step 6: Generate OTP & Booking
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Step 7: Prepare the request object 
    const bookingId = `REQ-${uuidv4()}`;

    const nowIST = dayjs().tz(IST)
    const localDate = nowIST.format("YYYY-MM-DD");

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
      localDate,
      bookingId,
      pickupDistanceKm,
      reassignedPartners: [partner._id],
      socketId: socketId || null,
      numberOfAmbulancesRequested: Number(numberOfAmbulancesRequested),
      remainingAmbulances: Number(numberOfRemainingAmbulances),
      assignedAmbulances: [],
      assignedAmbulancesByThisPartner: [],
    };

    // Step 8: Clean pendingRequests and add new one
    if (!Array.isArray(partner.pendingRequests)) {
      partner.pendingRequests = [];
    }

    partner.pendingRequests = partner.pendingRequests.filter(req =>
      req.userId && req.userName && req.pickup && req.drop
    );

    partner.pendingRequests.push(request);
    partner.markModified("pendingRequests");

    // Step 9: Save the updated partner  
    await partner.save();

    // Step 9.1: Get nearby partners (excluding current one)
    let nearbyHospitals = [];
    try {
      nearbyHospitals = await Partner.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: pickupCoordinates },
            distanceField: "distance",
            spherical: true,
            maxDistance: 5000, // 5km
            query: { _id: { $ne: partner._id } }, // Exclude the current partner
          },
        },
        {
          $sort: { distance: 1 }
        },
        {
          $project: {
            name: 1,
            address: 1,
            distance: { $round: ["$distance", 0] },
          },
        },
      ]);
    } catch (err) {
      console.error("Failed to fetch nearby hospitals:", err.message);
    }

    await AmbulanceRequest.create({
      bookingId,
      pickupLocation: {
        type: "Point",
        coordinates: pickupCoordinates,
      },
      dropLocation: {
        type: "Point",
        coordinates: dropCoordinates,
      },
      urgency,
      driverType: "PartnerDriver",
      assignedFromPartner: partner._id,
      reassignedPartners: [partner._id],
      reassignedPartnerNames: [partner.name],
      otp,
      pickupDistanceKm: pickupDistanceKm,
      distance: null,
      duration: null,
      amount: ambulanceCost?.toString() || "0",
      status: "requested",
      numberOfAmbulancesRequested: Number(numberOfAmbulancesRequested),
      remainingAmbulances: Number(numberOfRemainingAmbulances),
      assignedAmbulances: [],
      assignedAmbulancesByThisPartner: [],
    });

    try {
      // 1. Find nearby individual drivers
      const maxDistance = 5 * 1000; // 5 km

      const nearbyDrivers = await Driver.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: pickupCoordinates },
            $maxDistance: maxDistance,
          },
        },
        isAvailable: true, // availability logic
        status: "online",
        vehicleType: ambulanceType,
      });

      // 2. Emit to each online driver
      nearbyDrivers.forEach(driver => {
        const socketId = global.driverSockets.get(driver._id.toString());

        if (socketId) {
          global.io.to(socketId).emit("new_request", {
            requestId: request.bookingId,
            pickup,
            drop,
            urgency,
            ambulanceType,
            ambulanceCost,
            pickupDistanceKm,
            bookingId: request.bookingId
          });
        }
      });
    } catch (err) {
      console.error("Error emitting to nearby drivers:", err);
    }

    // Step 10: Respond with success
    res.status(200).json({
      status: "success",
      message: "request saved successfully.",
      request,
      nearbyHospitals,
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
    const { partnerId, bookingId, pickup, reassignedPartners = [], rejectionType } = req.body;
    const updatedReassignedPartners = [...reassignedPartners, partnerId];

    if (!partnerId || !bookingId || !pickup) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(404).json({ message: "Partner not found." });

    // Find the original request
    const request = partner.pendingRequests.find((r) => r.bookingId === bookingId);
    if (!request) return res.status(404).json({ message: "Request not found in partner." });

    // Mark original request as rejected (do not remove)
    request.status = "rejected & reassigned";
    request.rejectionType = rejectionType;
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
    ]);

    if (!nearbyPartners.length) {
      return res.status(404).json({ message: "No other nearby hospitals available." });
    }

    const newPartner = await Partner.findById(nearbyPartners[0]._id);

    const nowIST = dayjs().tz(IST);
    const localDate = nowIST.format("YYYY-MM-DD");

    // Prepare new request copy for reassignment
    const originalRequestData = typeof request.toObject === "function" ? request.toObject() : { ...request };

    const reassignedRequest = {
      ...originalRequestData,
      partnerId: newPartner._id,
      status: "reassigned",
      distance: +(nearbyPartners[0].distance / 1000).toFixed(2),
      timestamp: new Date(),
      localDate,
      reassignedPartners: updatedReassignedPartners,
      rejectedByPartnerName: partner.name,
      rejectionType: rejectionType,
    }

    if (!Array.isArray(newPartner.pendingRequests)) {
      newPartner.pendingRequests = [];
    }

    newPartner.pendingRequests.push(reassignedRequest);
    newPartner.updatedAt = new Date();
    newPartner.markModified("pendingRequests");
    await newPartner.save();

    res.status(200).json({
      status: "pending_user_selection",
      message: "Select a hospital for reassigning your request",
      nearbyHospitals: nearbyPartners.map((p) => ({
        _id: p._id,
        name: p.name,
        distance: +(p.distance / 1000).toFixed(2),
        email: p.email,
        address: p.address,
      })),
    });
  } catch (error) {
    console.error("❌ Error in rejectAndTransferRequest:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { partnerId, bookingId, rejectionType } = req.body;

    if (!partnerId || !bookingId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(404).json({ message: "Partner not found." });

    const request = partner.pendingRequests.find((r) => r.bookingId === bookingId);
    if (!request) return res.status(404).json({ message: "Request not found." });

    // Mark rejected in partner
    request.status = "rejected";
    request.rejectionType = rejectionType || "manual";
    partner.markModified("pendingRequests");
    await partner.save();

    // Fetch and update AmbulanceRequest
    const mainRequest = await AmbulanceRequest.findOne({ bookingId });
    if (!mainRequest) return res.status(404).json({ message: "Main request not found." });

    mainRequest.status = "rejected";
    mainRequest.rejectionType = rejectionType || "manual";

    const reassignedSet = new Set([...(mainRequest.reassignedPartners || []).map(id => id.toString()), partnerId.toString()]);
    mainRequest.reassignedPartners = [
      ...(mainRequest.reassignedPartners || []),
      {
        _id: new mongoose.Types.ObjectId(partnerId),
        name: partner.name,
        timestamp: new Date()
      }
    ];

    await mainRequest.save();

    // Get nearby hospitals (you may already have this logic)
    const uniqueReassignedIds = [...new Set(
      [...(mainRequest.reassignedPartners || []), partnerId].map(id => id.toString())
    )]
      .filter(id => mongoose.Types.ObjectId.isValid(id)) // filter invalid
      .map(id => new mongoose.Types.ObjectId(id));

    const nearbyHospitals = await Partner.find({
      _id: { $nin: uniqueReassignedIds },

      location: {
        $near: {
          $geometry: mainRequest.pickupLocation,
          $maxDistance: 5000,
        },
      },
    }).select("name email address location");

    const simplifiedHospitals = nearbyHospitals.map(h => ({
      _id: h._id,
      name: h.name,
      email: h.email,
      address: h.address,
      distance: null, // You can optionally compute & include actual distance using a geo lib if needed
    }));

    mainRequest.rejectionType = rejectionType || "manual";
    mainRequest.nearbyHospitals = simplifiedHospitals; // Save nearby hospitals to AmbulanceRequest

    await mainRequest.save();

    // Emit to user
    if (request.socketId) {
      global.io.to(request.socketId).emit("request_rejected_by_hospital", {
        bookingId,
        rejectedBy: partner.name,
        rejectionType,
      });
    }

    res.status(200).json({
      message: "Request rejected. Ask user to select a new hospital.",
      status: "rejected",
      nearbyHospitals,
    });

  } catch (error) {
    console.error("❌ Error in rejectRequest:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.confirmHospitalSelection = async (req, res) => {
  try {
    const { selectedPartnerId, originalPartnerId, bookingId, previousReassignedPartners = [], pickup, drop, ambulanceType, urgency, userName, remainingAmbulances, numberOfAmbulancesRequested } = req.body;

    if (!selectedPartnerId || !bookingId || !originalPartnerId || !pickup || !drop || !ambulanceType || !urgency || !userName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const lastPartnerId =
      previousReassignedPartners.length > 0
        ? previousReassignedPartners[previousReassignedPartners.length - 1]
        : originalPartnerId;
    console.log("lastPartnerId: ", lastPartnerId);

    const prevHospital = await Partner.findById(lastPartnerId.partnerId) || await Partner.findById(lastPartnerId);
    console.log("prevHospital: ", prevHospital);

    if (!prevHospital) {
      return res.status(404).json({ message: "Previous hospital not found" });
    }

    if (selectedPartnerId === lastPartnerId) {
      return res.status(400).json({ message: "Selected hospital is same as the previously rejected one." });
    }

    const originalPartner = await Partner.findById(originalPartnerId);
    if (!originalPartner) {
      return res.status(404).json({ message: "Original partner not found" });
    }

    const originalRequest = originalPartner.pendingRequests.find(r => r.bookingId === bookingId);
    if (!originalRequest) {
      return res.status(404).json({ message: "Original request not found" });
    }

    const updatedReassignedList = [...previousReassignedPartners, originalPartnerId];

    const selectedPartner = await Partner.findById(selectedPartnerId);
    if (!selectedPartner) {
      return res.status(404).json({ message: "Selected hospital not found" });
    }

    console.log("ORI REQ: ", originalRequest);
    const reassignedRequest = {
      ...originalRequest,
      pickup: pickup || originalRequest.pickup,
      drop: drop || originalRequest.drop,
      status: 'requested',
      bookingId,
      selectedPartnerId,
      timestamp: new Date(),
      reassignedPartners: updatedReassignedList,
      ambulanceType,
      urgency,
      userName,
      prevHospitalName: prevHospital?.name || "Unknown Hospital",
      hospitalName: selectedPartner.name,
      numberOfAmbulancesRequested,
      remainingAmbulances,
    };

    const alreadyPresent = selectedPartner.pendingRequests.some(req => req.bookingId === bookingId);

    if (!alreadyPresent) {
      selectedPartner.pendingRequests.push(reassignedRequest);
      await selectedPartner.save();
    }
    else {
      return res.status(400).json({ message: "Request already exists." });
    }

    await AmbulanceRequest.findOneAndUpdate(
      { bookingId },
      {
        $set: {
          status: 'requested',
          updatedAt: new Date(),
          rejectionType: originalRequest.rejectionType,
        },
      }
    );

    if (originalRequest?.socketId) {
      global.io.to(originalRequest.socketId).emit("hospital_reassigned", {
        message: "Request reassigned to your selected hospital",
        hospital: selectedPartner.name,
        hospitalId: selectedPartner._id,
        hospitalEmail: selectedPartner.email,
        bookingId,
        prevHospitalName: prevHospital?.name || "Unknown Hospital",
      });
    }

    res.status(200).json({
      message: "Request reassigned successfully",
      reassignedRequest,
      prevHospitalName: prevHospital?.name || "Unknown Hospital",
    });

  } catch (error) {
    console.error("Error confirming hospital selection:", error);
    res.status(500).json({ message: "Failed to confirm hospital" });
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

    const request = partner.pendingRequests.find(r => r.bookingId === requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    request.status = newStatus.toLowerCase().trim();

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
            status: (req.status.toLowerCase() || "").toLowerCase(),
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
      else if (req.status.toLowerCase() === "rejected") {
        grouped[req.date].rejected += 1;
      }

    });

    const reports = Object.values(grouped);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports for partner:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.storeResponseTime = async (req, res) => {
  try {
    const { partnerId, bookingId, responseTime, action } = req.body;

    res.status(200).json({ message: "Response time recorded successfully." });
  } catch (error) {
    console.error("❌ Failed to store response time:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Utility: Mark request as assigned in partner.pendingRequests[]
exports.markPartnerRequestAsAssigned = async (bookingId, driverId) => {
  try {
    const partner = await Partner.findOne({ "pendingRequests.bookingId": bookingId });
    if (!partner) return;

    const request = partner.pendingRequests.find(r => r.bookingId === bookingId);
    if (request) {
      request.status = "assigned_by_individual_driver";
      request.assignedDriverId = driverId;
      await partner.save();
    }

    await AmbulanceRequest.findOneAndUpdate(
      { bookingId },
      {
        $set: { status: "assigned_by_individual_driver" },
        $push: {
          assignedAmbulances: {
            driverId,
            assignedAt: new Date(),
            status: "assigned", // or whatever initial status you prefer
          },
          assignedAmbulancesByThisPartner: {
            driverId,
            assignedAt: new Date(),
            status: "assigned_by_individual_driver",
          },
        },
      }
    );

  } catch (err) {
    console.error("❌ Error in markPartnerRequestAsAssigned:", err.message);
  }
};

