// Static ambulance types & their prices
const ambulanceTypes = [
  { type: "Basic Life Support (No oxygen cylinder)", price: 500 },
  { type: "Advanced Life Support (With oxygen, medical equipment, trained staff)", price: 1000 },
  { type: "Critical Care Ambulance(Ambulance with doctor)", price: 1500 },
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
