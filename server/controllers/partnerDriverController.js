const mongoose = require("mongoose");
const PartnerDriver = require("../models/PartnerDriverModel");
const Partner = require("../models/PartnerModel");
const AmbulanceRequest = require("../models/AmbulanceRequestModel");

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

    if (!updatedDriver) {
      return res.status(404).json({ message: "Partner driver not found" });
    }

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

    if (!partnerId || !requestId || !driverId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const partner = await Partner.findById(partnerId);
    if (!partner) return res.status(404).json({ message: "Partner not found" });

    const request = partner.pendingRequests.find((r) => r.bookingId === requestId);

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

    // Update driver
    driver.available = false;
    driver.status = "unavailable";
    driver.assignedRequestId = request.bookingId;
    driver.otp = otp;

    await driver.save();

    const index = partner.pendingRequests.findIndex(r => r.bookingId === requestId);

    const updatedPendingRequest = {
      ...partner.pendingRequests[index]?._doc,
      status: "assigned",
      driverId: driver._id,
      assignedDriverId: driver._id,
      driverName: driver.name,
      phone: driver.phone,
      otp,
      driverType: "PartnerDriver",
      ambulancePlateNumber: driver.ambulancePlateNumber,
    };

    if (index !== -1) {
      partner.pendingRequests[index] = {
        ...partner.pendingRequests[index]._doc,
        status: "assigned",
        driverId: driver._id,
        assignedDriverId: driver._id,
        driverName: driver.name,
        phone: driver.phone,
        otp,
        driverType: "PartnerDriver",
        ambulancePlateNumber: driver.ambulancePlateNumber,
      };

      if (!partner.pendingRequests[index].assignedAmbulancesByThisPartner) {
        partner.pendingRequests[index].assignedAmbulancesByThisPartner = [];
      }

      partner.pendingRequests[index].assignedAmbulancesByThisPartner.push({
        driverId: driver._id,
        partnerId,
        plateNumber: driver.ambulancePlateNumber,
        assignedAt: new Date(),
        status: "assigned",
        driverType: "PartnerDriver",
      });

      partner.markModified(`pendingRequests.${index}`);
    } else {
      partner.pendingRequests.push(updatedPendingRequest);
      partner.markModified("pendingRequests");
    }

    await partner.save();

    // ✅ Update the main AmbulanceRequest collection so WaitingForDriver can read the driver
    const mainRequest = await AmbulanceRequest.findOne({ bookingId: requestId });

    if (mainRequest) {
      const assignedAmbulanceObj = {
        driverId: driver._id,
        partnerId,
        plateNumber: driver.ambulancePlateNumber,
        name: driver.name,
        phone: driver.phone,
        otp,
        status: "assigned",
        assignedAt: new Date(),
        driverType: "PartnerDriver",
      };

      mainRequest.assignedAmbulances = [
        ...(mainRequest.assignedAmbulances || []),
        assignedAmbulanceObj,
      ];

      mainRequest.status = "assigned";
      await mainRequest.save();
    }

    const assignedByThisPartner = mainRequest.assignedAmbulances.filter(
      amb => amb.partnerId?.toString() === partnerId
    );

    return res.status(200).json({
      message: "Driver assigned successfully.",
      driver: {
        name: driver.name,
        phone: driver.phone,
        plate: driver.ambulancePlateNumber,
        otp,
      },
      request,
      assignedAmbulancesByThis: assignedByThisPartner.length,
    });

  } catch (error) {
    console.error("❌ Error assigning driver:", error);
    res.status(500).json({
      message: "Server error while assigning driver.",
      error: error.message,
    });
  }
};

const assignMultipleAmbulances = async (req, res) => {
  try {
    const { bookingId, ambulances, partnerId } = req.body;

    if (!bookingId || !partnerId || !Array.isArray(ambulances) || ambulances.length === 0) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    const partner = await Partner.findById(partnerId);
    const request = await AmbulanceRequest.findOne({ bookingId });

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    if (!request) {
      return res.status(404).json({ message: "Ambulance request not found" });
    }

    const formattedAmbulances = [];

    for (let ambulance of ambulances) {
      const driver = await PartnerDriver.findById(ambulance.driverId);

      if (!driver || !driver.available) {
        continue;
      }

      if (driver.assignedRequestId?.toString() === bookingId) {
        continue; // already assigned
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      driver.available = false;
      driver.status = "unavailable";
      driver.assignedRequestId = bookingId;
      driver.otp = otp;
      await driver.save();

      formattedAmbulances.push({
        driverId: driver._id,
        partnerId,
        plateNumber: driver.ambulancePlateNumber,
        name: driver.name,
        phone: driver.phone,
        otp,
        status: "assigned",
        assignedAt: new Date(),
        driverType: "PartnerDriver",
      })
    }

    const newlyAssignedCount = formattedAmbulances.length;
    if (newlyAssignedCount === 0) {
      return res.status(400).json({ message: "No ambulances could be assigned." });
    }

    const totalPreviouslyAssigned = request.assignedAmbulances?.length || 0;
    const totalAssigned = totalPreviouslyAssigned + newlyAssignedCount;
    const totalRequested = request.numberOfAmbulancesRequested;

    if (totalAssigned < totalRequested) {
      request.status = "partially_assigned";
      request.remainingAmbulances = totalRequested - totalAssigned;
    } else {
      request.status = "fully_assigned";
      request.remainingAmbulances = 0;
    }

    request.assignedAmbulances = [
      ...(request.assignedAmbulances || []),
      ...formattedAmbulances,
    ];

    const assignedByThisPartner = request.assignedAmbulances.filter(
      amb => amb.partnerId?.toString() === partnerId
    );

    // Track partner-specific assignment
    request.reassignedPartners = [
      ...(request.reassignedPartners || []),
      {
        partnerId,
        assignedCount: newlyAssignedCount,
      }
    ];

    // If still not fulfilled, update remaining
    if (totalAssigned < totalRequested) {
      request.status = "partially_assigned";
      request.remainingAmbulances = totalRequested - totalAssigned;
    } else {
      request.status = "assigned";
      request.remainingAmbulances = 0;
    }

    if (formattedAmbulances.length === 0) {
      return res.status(400).json({ message: "No available ambulances could be assigned." });
    }

    await request.save();

    // update request inside partner.pendingRequests
    const index = partner.pendingRequests.findIndex(
      (r) => r.bookingId === bookingId
    );

    if (index !== -1) {
      partner.pendingRequests[index].status = request.status;
      partner.pendingRequests[index].assignedAmbulances = request.assignedAmbulances;

      request.reassignHistory = [
        ...(request.reassignHistory || []),
        {
          partnerId: partnerId,
          assignedCount: newlyAssignedCount,
          timestamp: new Date()
        }
      ];

      partner.markModified(`pendingRequests.${index}`);

      if (!partner.pendingRequests[index].assignedAmbulancesByThisPartner) {
        partner.pendingRequests[index].assignedAmbulancesByThisPartner = [];
      }

      partner.pendingRequests[index].assignedAmbulancesByThisPartner.push(
        ...formattedAmbulances.map(a => ({
          driverId: a.driverId,
          partnerId,
          plateNumber: a.plateNumber,
          assignedAt: a.assignedAt,
          status: "assigned",
          driverType: "PartnerDriver",
        }))
      );

      partner.markModified(`pendingRequests.${index}.assignedAmbulancesByThisPartner`);

    } else {
      partner.pendingRequests.push({
        bookingId: request.bookingId,
        userId: request.userId,
        userName: request.userName,
        pickup: request.pickup,
        drop: request.drop,
        urgency: request.urgency,
        ambulanceType: request.ambulanceType,
        ambulanceCost: request.ambulanceCost,
        status: request.status,
        timestamp: request.timestamp,
        localDate: request.localDate,
        numberOfAmbulancesRequested: request.numberOfAmbulancesRequested,
        assignedAmbulances: request.assignedAmbulances,
        assignedAmbulancesByThisPartner: request.assignedAmbulancesByThisPartner,
        numberOfRemainingAmbulances: request.numberOfAmbulancesRequested - request.assignedAmbulances.length,
      });
    }

    partner.markModified("pendingRequests");
    await partner.save();

    res.status(200).json({
      status: "success",
      message: `${newlyAssignedCount} ambulances assigned. ${request.remainingAmbulances || 0} remaining.`,
      data: request.assignedAmbulances,
      remainingAmbulances: request.remainingAmbulances,
      assignedAmbulancesByThis: assignedByThisPartner.length,
    });

  } catch (err) {
    console.error("❌ Error in assignMultipleAmbulances:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllPartnerDrivers,
  registerPartnerDriver,
  getPartnerDriversByPartnerId,
  updatePartnerDriver,
  deletePartnerDriver,
  assignDriverToRequest,
  assignMultipleAmbulances,
};
