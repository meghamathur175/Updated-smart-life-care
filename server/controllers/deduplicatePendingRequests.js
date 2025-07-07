const mongoose = require("mongoose");
const Partner = require("../models/PartnerModel"); // adjust path

const MONGO_URI = "mongodb+srv://AmbulanceRequest:Ambulance%401234@ambulancerequest.tzoepzu.mongodb.net/"; // change this

async function removeDuplicateRequests() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const partners = await Partner.find();

  for (const partner of partners) {
    const seenBookingIds = new Set();
    const uniqueRequests = [];

    for (const req of partner.pendingRequests || []) {
      if (!seenBookingIds.has(req.bookingId)) {
        uniqueRequests.push(req);
        seenBookingIds.add(req.bookingId);
      } else {
        console.log(`🗑️ Duplicate found for partner ${partner.name}: ${req.bookingId}`);
      }
    }

    if (uniqueRequests.length !== (partner.pendingRequests || []).length) {
      partner.pendingRequests = uniqueRequests;
      await partner.save();
      console.log(`✅ Cleaned duplicates for partner: ${partner.name}`);
    }
  }

  console.log("🎉 Deduplication complete.");
  mongoose.disconnect();
}

removeDuplicateRequests().catch((err) => {
  console.error("❌ Error cleaning duplicates:", err);
});
