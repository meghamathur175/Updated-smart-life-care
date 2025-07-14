const Partner = require("../models/PartnerModel");
const PartnerDriver = require("../models/PartnerDriverModel");
const AmbulanceRequest = require("../models/AmbulanceRequestModel");
const IndividualDriver = require("../models/IndividualDriverModel");

exports.getRequestStatusByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.bookingId?.trim();

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    // STEP 1: Check in Partner's pendingRequests
    const partnerList = await Partner.find(
      { "pendingRequests.bookingId": bookingId },
      {
        name: 1,
        updatedAt: 1,
        pendingRequests: { $elemMatch: { bookingId } }
      }
    ).sort({ updatedAt: -1 });

    const partner = partnerList?.[0];
    const request = partner?.pendingRequests?.[0];

    if (request && request.status !== "assigned_by_individual_driver") {
      let driverName = "Unavailable";
      let ambulancePlateNumber = "Unavailable";
      let otp = "0000";
      let phone = "000-000-0000";
      let hospitalName = partner?.name || "Partner Hospital";
      let finalStatus = request.status?.toLowerCase() || "pending";

      // 🚑 If already assigned, fetch driver details
      if (finalStatus === "assigned") {
        const assignedDriver = await PartnerDriver.findOne({ assignedRequestId: bookingId });
        if (assignedDriver) {
          driverName = assignedDriver.name || driverName;
          ambulancePlateNumber = assignedDriver.ambulancePlateNumber || ambulancePlateNumber;
          otp = assignedDriver.otp || otp;
          phone = assignedDriver.phone || phone;
        } else {
          finalStatus = "searching";
        }
      }

      // Include nearbyHospitals if rejected and reassignment is needed
      let nearbyHospitals = [];
      if (finalStatus === "rejected") {
        const independentRequest = await AmbulanceRequest.findOne({ bookingId });
        console.log("independentRequest in getRequestStatusByBookingId: ", independentRequest);
        
        if (independentRequest?.pickupLocation?.coordinates) {
          const excludedPartnerIds = independentRequest.reassignedPartners || [];

          const coords = independentRequest?.pickupLocation?.coordinates;

          if (
            !Array.isArray(coords) ||
            coords.length !== 2 ||
            typeof coords[0] !== "number" ||
            typeof coords[1] !== "number"
          ) {
            console.warn("❌ Invalid pickup coordinates:", coords);
          }
          nearbyHospitals = await Partner.aggregate([
            {
              $geoNear: {
                near: independentRequest.pickupLocation,
                distanceField: "distance",
                maxDistance: 5000,
                spherical: true,
                query: { _id: { $nin: excludedPartnerIds } }
              }
            },
            {
              $project: {
                name: 1,
                address: 1,
                distance: 1
              }
            },
            { $sort: { distance: 1 } }
          ]);
        } else {
          console.log("⚠️ Missing pickupLocation or coordinates in independentRequest");
        }
      }

      return res.status(200).json({
        status: finalStatus,
        driverType: "PartnerDriver",
        driverName,
        ambulancePlateNumber,
        otp,
        phone,
        hospitalName,
        nearbyHospitals, 
      });
    }

    // 🔍 STEP 2: Check in Independent Ambulance Requests
    const independentRequest = await AmbulanceRequest.findOne({ bookingId });

    if (!independentRequest) {
      return res.status(404).json({ message: "No request found for the given booking ID." });
    }

    const status = independentRequest.status?.toLowerCase() || "searching";
    const driverType = independentRequest.driverType || "IndependentDriver";

    // 🚗 If assigned by individual driver
    if (status === "assigned_by_individual_driver" || status === "assigned") {
      let driverName = "Unavailable";
      let ambulancePlateNumber = "Unavailable";
      let phone = "000-000-0000";
      let otp = independentRequest.otp || "0000";

      if (independentRequest.assignedDriver) {
        const driver = await IndividualDriver.findById(independentRequest.assignedDriver);
        if (driver) {
          driverName = `${driver.firstName} ${driver.lastName}`;
          ambulancePlateNumber = driver.ambulancePlateNumber || ambulancePlateNumber;
          phone = driver.phone || phone;
        }
      }

      return res.status(200).json({
        status,
        driverType,
        driverName,
        ambulancePlateNumber,
        otp,
        phone,
      });
    }

    if (
      status === "rejected" &&
      Array.isArray(independentRequest.nearbyHospitals) &&
      independentRequest.nearbyHospitals.length > 0
    ) {
      const nearbyHospitals = independentRequest.nearbyHospitals.sort((a, b) => a.distance - b.distance);
      console.log("NEARBY hospitals in getRequestStatusByBookingId : ", nearbyHospitals);

      return res.status(200).json({
        status: "rejected",
        nearbyHospitals,
        bookingId,
      });
    }

    // 🔄 Still searching
    return res.status(200).json({
      status,
      driverType,
    });

  } catch (error) {
    console.error("❌ Error in getRequestStatusByBookingId:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
