const Partner = require("../models/PartnerModel");

exports.getAdminReports = async (req, res) => {
  try {
    const partners = await Partner.find();

    const reports = partners.map((partner) => {
      let accepted = 0;
      let rejected = 0;

      partner.pendingRequests.forEach((req) => {
        const status = req?.status?.toLowerCase();
        if (status === "accepted") accepted++;
        else if (status === "rejected") rejected++;
      });

      return {
        date: partner.createdAt.toISOString().split("T")[0], 
        trips: partner.pendingRequests.length,
        accepted,
        rejected,
        revenue: (partner.commission * accepted * 100) || 0, 
        referrals: 0,
      };
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error generating admin reports:", error.message);
    res.status(500).json({ message: "Failed to fetch admin reports" });
  }
};
