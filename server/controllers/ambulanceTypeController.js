// Static ambulance types & their prices
const ambulanceTypes = [
  { type: "Basic Life Support (BLS)", price: 500 },
  { type: "Advanced Life Support (ALS)", price: 1000 },
  { type: "Patient Transport Ambulance (PTA)", price: 400 },
  { type: "Neonatal Ambulance", price: 1200 },
  { type: "Mortuary Ambulance", price: 600 },
  { type: "Air Ambulance", price: 10000 },
  { type: "Water Ambulance", price: 3000 },
  { type: "4x4 Ambulance", price: 800 },
  { type: "ICU Ambulance", price: 1500 },
  { type: "Cardiac Ambulance", price: 1800 },
];

// Controller function
const getAmbulanceTypes = (req, res) => {
  try {
    res.status(200).json(ambulanceTypes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ambulance types" });
  }
};

module.exports = {
  getAmbulanceTypes,
};
