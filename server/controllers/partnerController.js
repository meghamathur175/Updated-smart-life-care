const Partner = require("../models/Partner");

// GET: Get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find();
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST: Add new partner
exports.addPartner = async (req, res) => {
  try {
    const { name, location, serviceAreas, commission } = req.body;

    // Basic validation
    if (!name || !location || !serviceAreas || commission == null) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newPartner = new Partner({
      name,
      location,
      serviceAreas,
      commission,
    });

    await newPartner.save();
    res.status(201).json(newPartner);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to add partner", error: error.message });
  }
};

// PUT: Update existing partner
exports.updatePartner = async (req, res) => {
  try {
    const partnerId = req.params.id;
    const updatedData = req.body;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    const updatedPartner = await Partner.findByIdAndUpdate(
      partnerId,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedPartner);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update partner", error: error.message });
  }
};

// DELETE: Delete existing partner
exports.deletePartner = async (req, res) => {
  try {
    const partnerId = req.params.id;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    await Partner.findByIdAndDelete(partnerId);
    res.status(200).json({ message: "Partner deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete partner", error: error.message });
  }
};
