const PartnerDriver = require("../models/PartnerDriverModel");
const Partner = require("../models/PartnerModel");
const AmbulanceRequest = require("../models/AmbulanceRequestModel");
const IndividualDriver = require("../models/IndividualDriverModel");

exports.getRequestStatusByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.bookingId?.trim();

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    const independentRequest = await AmbulanceRequest.findOne({ bookingId });

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

    // STEP 1.A: Handle Partner - Partially Assigned Requests
    if (request?.status === "partially_assigned") {
      let assignedDrivers = [];

      if (Array.isArray(independentRequest.assignedAmbulances)) {

        const ambulancesByAllPartners = request.assignedAmbulances || [];

        assignedDrivers = await Promise.all(
          (request.assignedAmbulances || []).map(async (item) => {
            try {
              const driver = await PartnerDriver.findById(item.driverId);
              const assigningPartner = await Partner.findById(item.partnerId);

              if (!driver) {
                console.warn("⚠️ Driver not found for driverId:", item.driverId);
                return null;
              }

              return {
                driverType: "PartnerDriver",
                name: driver.name || "Unavailable",
                ambulancePlateNumber: driver.ambulancePlateNumber || "Unavailable",
                otp: driver.otp || "0000",
                phone: driver.phone || "N/A",
                partnerId: item.partnerId,
                assignedByPartnerName: assigningPartner?.name || "Unknown",
                reassignedPartners: independentRequest?.reassignedPartners || [],
              };
            } catch (err) {
              console.error("❌ Error loading driver/partner", err);
              return null;
            }
          })
        );

        // Remove nulls (failed lookups)
        assignedDrivers = assignedDrivers.filter(Boolean);

      }

      let nearbyHospitals = [];
      if (independentRequest?.pickupLocation?.coordinates) {
        const excludedPartnerIds = independentRequest.reassignedPartners || [];
        const coords = independentRequest.pickupLocation.coordinates;

        if (
          Array.isArray(coords) &&
          coords.length === 2 &&
          typeof coords[0] === "number" &&
          typeof coords[1] === "number"
        ) {
          nearbyHospitals = await Partner.aggregate([
            {
              $geoNear: {
                near: independentRequest.pickupLocation,
                distanceField: "distance",
                maxDistance: 5000,
                spherical: true,
                query: { _id: { $nin: excludedPartnerIds } },
              },
            },
            {
              $project: {
                name: 1,
                address: 1,
                distance: {
                  $round: [{ $divide: ["$distance", 1000] }, 2] // ✅ Convert meters to km, round to 2 decimal places
                },
                geometry: {
                  location: {
                    lat: { $arrayElemAt: ["$location.coordinates", 1] },
                    lng: { $arrayElemAt: ["$location.coordinates", 0] },
                  },
                },
              },
            },
            { $sort: { distance: 1 } },
          ]);
        } else {
          console.warn("❌ Invalid pickup coordinates:", coords);
        }
      }

      return res.status(200).json({
        status: "partially_assigned",
        driverType: "PartnerDriver",
        assignedDrivers,
        hospitalName: partner?.name || "Partner Hospital",
        hospitalId: partner?._id,
        nearbyHospitals,
        pickupCoordinates: independentRequest?.pickupLocation?.coordinates || [],
        timestamp: independentRequest?.createdAt || request?.createdAt || Date.now(),
        numberOfAmbulancesRequested: independentRequest?.numberOfAmbulancesRequested || request?.numberOfAmbulancesRequested || 1,
        remainingAmbulances: (independentRequest?.numberOfAmbulancesRequested || request?.numberOfAmbulancesRequested || 1) - assignedDrivers.length,
        reassignedPartners: independentRequest?.reassignedPartners || [],
      });
    }

    if (request && request.status !== "assigned_by_individual_driver") {
      let hospitalName = partner?.name || "Partner Hospital";
      let finalStatus = request.status?.toLowerCase() || "pending";

      const numberOfAmbulancesRequested = independentRequest?.numberOfAmbulancesRequested || request?.numberOfAmbulancesRequested || 1;
      let assignedDrivers = [];

      if (numberOfAmbulancesRequested === 1) {
        let driver;

        if (!request.assignedDriverId) {
          driver = await PartnerDriver.findOne({
            partnerId: request.partnerId,
            isAvailable: true,
          });

          if (driver) {
            request.assignedDriverId = driver._id;
            driver.available = false;

            await partner.save();
            await driver.save();
          }
        } else {
          driver = await PartnerDriver.findById(request.assignedDriverId);
        }

        if (driver) {
          assignedDrivers.push({
            driverType: "PartnerDriver",
            name: driver?.name || "Unavailable",
            ambulancePlateNumber: driver?.ambulancePlateNumber || "Unavailable",
            otp: driver?.otp || "0000",
            phone: driver?.phone || "N/A",
          });
        }
      } else {
        // Multi-ambulance assignment
        if (Array.isArray(independentRequest?.assignedAmbulances)) {
          const allAmbulances = independentRequest.assignedAmbulances;

          const multiple = await Promise.all(
            allAmbulances.map(async (item) => {
              try {
                const driver = await PartnerDriver.findById(item.driverId);
                const assigningPartner = await Partner.findById(item.partnerId);
                if (!driver) return null;

                return {
                  driverType: "PartnerDriver",
                  name: driver?.name || "Unavailable",
                  ambulancePlateNumber: driver?.ambulancePlateNumber || "Unavailable",
                  otp: driver?.otp || "0000",
                  phone: driver?.phone || "N/A",
                  partnerId: item.partnerId,
                  assignedByPartnerName: assigningPartner?.name || "Unknown",
                  reassignedPartners: independentRequest?.reassignedPartners || [],
                };
              } catch (err) {
                console.error("Error fetching driver:", err);
                return null;
              }
            })
          );

          assignedDrivers = multiple.filter(Boolean);
        }

      }

      // Nearby hospitals for reassignment
      let nearbyHospitals = [];
      if (finalStatus === "rejected") {
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
                distance: {
                  $round: [{ $divide: ["$distance", 1000] }, 2] // Convert meters to km, round to 2 decimal places
                },
                geometry: {
                  location: {
                    lat: { $arrayElemAt: ["$location.coordinates", 1] },
                    lng: { $arrayElemAt: ["$location.coordinates", 0] }
                  }
                }
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
        assignedDrivers,
        hospitalName,
        nearbyHospitals,
        pickupCoordinates: independentRequest?.pickupLocation?.coordinates || [],
        timestamp: independentRequest?.createdAt || request?.createdAt || Date.now(),
        numberOfAmbulancesRequested,
        remainingAmbulances: numberOfAmbulancesRequested - assignedDrivers.length,
        reassignedPartners: independentRequest?.reassignedPartners || [],
      });
    }

    // STEP 2: Independent Driver flow
    if (!independentRequest) {
      return res.status(404).json({ message: "No request found for the given booking ID." });
    }

    const numberOfAmbulancesRequested = independentRequest?.numberOfAmbulancesRequested || 1;
    const status = independentRequest.status?.toLowerCase() || "searching";
    const driverType = independentRequest.driverType || "IndependentDriver";

    if (status === "assigned_by_individual_driver" || status === "assigned") {
      let otp = independentRequest.otp || "0000";
      let assignedDrivers = [];

      if (independentRequest.assignedDriver) {
        const driver = await IndividualDriver.findById(independentRequest.assignedDriver);
        if (driver) {
          assignedDrivers.push({
            driverType: "IndependentDriver",
            name: `${driver.firstName} ${driver.lastName}`,
            ambulancePlateNumber: driver.ambulancePlateNumber || "Unavailable",
            otp,
            phone: driver.phone || "N/A",
          });
        }
      }

      return res.status(200).json({
        status,
        driverType,
        assignedDrivers,
        pickupCoordinates: independentRequest?.pickupLocation?.coordinates || [],
        timestamp: independentRequest?.createdAt || Date.now(),
        numberOfAmbulancesRequested,
        remainingAmbulances: numberOfAmbulancesRequested - assignedDrivers.length,
      });
    }

    // Independent rejected → nearbyHospitals fallback
    if (
      status === "rejected" &&
      Array.isArray(independentRequest.nearbyHospitals) &&
      independentRequest.nearbyHospitals.length > 0
    ) {
      const nearbyHospitals = independentRequest.nearbyHospitals.sort((a, b) => a.distance - b.distance);

      return res.status(200).json({
        status: status,
        driverType: "PartnerDriver",
        assignedDrivers,
        hospitalName,
        nearbyHospitals,
        pickupCoordinates: independentRequest?.pickupLocation?.coordinates || [],
        numberOfAmbulancesRequested,
        remainingAmbulances: numberOfAmbulancesRequested - assignedDrivers.length,
        timestamp: independentRequest?.createdAt || request?.createdAt || Date.now(),
        reassignedPartners: independentRequest?.reassignedPartners || [],
      });

    }

    // Default searching response
    return res.status(200).json({
      status,
      driverType,
      numberOfAmbulancesRequested,
    });

  } catch (error) {
    console.error("❌ Error in getRequestStatusByBookingId:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
