const express = require("express");
const {
  getAllPartners,
  addPartner,
  updatePartner,
  deletePartner,
  confirmRequestToPartner,
  getPartnerRequests,
  getPartnerByHospitalPlaceId,
  updateRequestStatus,
  getPartnerById,
  getReports,
} = require("../controllers/partnerController");

const router = express.Router();

// Routes
router.get("/", getAllPartners); // GET all partners
router.post("/", addPartner); // POST a new partner
router.put("/:id", updatePartner); // PUT update a partner by ID
router.delete("/:id", deletePartner); // DELETE a partner by ID
router.post("/confirm-request", confirmRequestToPartner); // Confirm button request
router.get("/:id/requests", getPartnerRequests);
router.post("/update-request-status", updateRequestStatus);
router.get("/by-hospital/:place_id", getPartnerByHospitalPlaceId);
router.get("/:id/reports", getReports); 
router.get("/:id", getPartnerById);

module.exports = router;
