const mongoose = require("mongoose");
const Partner = require("../models/PartnerModel");
require("dotenv").config();

// Connect to DB
const mongoUri = "mongodb+srv://AmbulanceRequest:Ambulance%401234@ambulancerequest.tzoepzu.mongodb.net/";

mongoose.connect(mongoUri, {
  dbName: "smart-life-care",
})
.then(() => console.log("✅ DB connected"))
.catch((err) => {
  console.error("❌ DB connection error:", err);
  process.exit(1);
});

async function fixMissingOtps() {
  try {
    const partners = await Partner.find();

    for (const partner of partners) {
      let modified = false;

      // Fix all pendingRequests where otp is missing
      const updatedRequests = partner.pendingRequests.map((request) => {
        if (!request.otp) {
          request.otp = Math.floor(1000 + Math.random() * 9000).toString();
          modified = true;
        }
        return request;
      });

      if (modified) {
        partner.pendingRequests = updatedRequests;
        await partner.save();
        console.log(`🔧 Fixed Partner ID: ${partner._id}`);
      }
    }

    console.log("🎉 All pendingRequests are now updated with OTPs.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing OTPs:", error);
    process.exit(1);
  }
}

fixMissingOtps();
