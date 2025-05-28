const express = require("express");
const {
  getAllPartners,
  addPartner,
  updatePartner,
  deletePartner,
} = require("../controllers/partnerController");

const router = express.Router();

// Routes
router.get("/", getAllPartners); // GET all partners
router.post("/", addPartner); // POST a new partner
router.put("/:id", updatePartner); // PUT update a partner by ID
router.delete("/:id", deletePartner); // DELETE a partner by ID

module.exports = router;
