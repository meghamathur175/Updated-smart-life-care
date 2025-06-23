const Partner = require("../models/PartnerModel");
const AmbulanceRequest = require('../models/AmbulanceRequest');

exports.getAdminReports = async (req, res) => {
  try {
    const partners = await Partner.find();

    const reportMap = {};

    partners.forEach((partner) => {
      partner.pendingRequests.forEach((req) => {
        const date = new Date(req.timestamp).toISOString().split("T")[0];
        const status = req?.status?.toLowerCase();

        if (!reportMap[date]) {
          reportMap[date] = {
            date,
            trips: 0,
            accepted: 0,
            rejected: 0,
            revenue: 0,   
            referrals: 0, 
          };
        }

        reportMap[date].trips += 1;

        if (status === "accepted" || status === "assigned") {
          reportMap[date].accepted += 1;
          reportMap[date].revenue += req.ambulanceCost || 0;
        }
        else if (req.status.toLowerCase() === "rejected" || req.status.toLowerCase() === "rejected & reassigned") reportMap[date].rejected += 1;
      });
    });

    const reports = Object.values(reportMap);

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error generating admin reports:", error.message);
    res.status(500).json({ message: "Failed to fetch admin reports" });
  }
};

exports.getRevenueStats = async (req, res) => {
  try {
    const requests = await AmbulanceRequest.find({});

    let distanceRevenue = 0;
    let commissionRevenue = 0;

    requests.forEach((req) => {
      const km = parseFloat(req.distance?.replace("km", "").trim());
      const amount = parseFloat(req.amount);

      if (!isNaN(km)) {
        distanceRevenue += km * 10; // ₹10/km
      }

      if (!isNaN(amount)) {
        commissionRevenue += amount * 0.2; // 20% commission
      }
    });

    res.json({
      distanceRevenue: distanceRevenue.toFixed(2),
      commissionRevenue: commissionRevenue.toFixed(2),
    });
  } catch (err) {
    console.error("Error in getRevenueStats:", err);
    res.status(500).json({ error: "Failed to get revenue stats" });
  }
};
