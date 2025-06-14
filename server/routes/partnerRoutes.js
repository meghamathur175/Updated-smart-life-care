const express = require("express");
const { verifyPartner } = require("../middleware/partnerVerification");
const {
  getAllPartners,
  addPartner,
  updatePartner,
  deletePartner,
  confirmRequestToPartner,
  getPartnerByHospitalPlaceId,
  updateRequestStatus,
  getPartnerById,
  getReports,
  getPartnerRequests,
} = require("../controllers/partnerController");

const router = express.Router();

router.get("/partner-requests", verifyPartner, getPartnerRequests);
router.get("/", getAllPartners);
router.post("/", addPartner);
router.put("/:id", updatePartner);
router.delete("/:id", deletePartner);

router.post("/confirm-request", confirmRequestToPartner);
router.post("/update-request-status", updateRequestStatus);

router.get("/by-hospital/:place_id", getPartnerByHospitalPlaceId);

router.get("/:id/reports", getReports);
router.get("/:id", getPartnerById);

module.exports = router;
