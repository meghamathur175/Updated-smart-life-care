const Partner = require("../models/PartnerModel");

exports.getAdminReports = async (req, res) => {
  try {
    const partners = await Partner.find();

    const reportMap = {};

    partners.forEach((partner) => {
      partner.pendingRequests.forEach((req) => {
        const date = new Date(req.timestamp).toISOString().split("T")[0];
        const status = req?.status?.toLowerCase().trim();

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

        } else if (status === "rejected") {
          reportMap[date].rejected += 1;
        }
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
    const partners = await Partner.find();

    let totalRevenue = 0;

    partners.forEach((partner) => {
      partner.pendingRequests.forEach((req) => {
        const status = req?.status?.toLowerCase();

        if (status === "accepted" || status === "assigned") {
          const revenue = req.ambulanceCost;
          if (typeof revenue === "number" && !isNaN(revenue)) {
            totalRevenue += revenue;
          }
        }
      });
    });

    const commissionRevenue = totalRevenue * 0.2;
    const distanceRevenue = totalRevenue * 0.8;
    res.json({
      distanceRevenue: distanceRevenue.toFixed(2),
      commissionRevenue: commissionRevenue.toFixed(2),
    });
  } catch (err) {
    console.error("Error in getRevenueStats:", err);
    res.status(500).json({ error: "Failed to get revenue stats" });
  }
};