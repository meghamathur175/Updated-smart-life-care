const Partner = require("../models/PartnerModel");

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

        if (status === "accepted") reportMap[date].accepted += 1;
        else if (status === "rejected") reportMap[date].rejected += 1;
      });
    });

    const reports = Object.values(reportMap);

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error generating admin reports:", error.message);
    res.status(500).json({ message: "Failed to fetch admin reports" });
  }
};
