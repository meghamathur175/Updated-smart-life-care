import React, { useState, useEffect } from "react";
import "../styles/CommissionManagement.css";
import axios from "axios";

const CommissionManager = () => {
  const [partners, setPartners] = useState([]);
  const apiUrl = "http://localhost:3001/api/Partners";

  const handleCommissionChange = async (partnerId, value) => {
    const commission = parseFloat(value);

    if (commission >= 3 && commission <= 5) {
      // Updating the frontend state
      setPartners((prev) =>
        prev.map((p) => (p._id === partnerId ? { ...p, commission } : p))
      );

      // 2. Send the updated commission to the backend
      try {
        const response = await axios.put(`http://localhost:3001/api/Partners/${partnerId}`, {
          commission: commission,
        });

        console.log("Commission updated successfully:", response.data);
      } catch (error) {
        console.error("Failed to update commission in backend:", error);
      }
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await axios.get(apiUrl);
      console.log("PARTNERS: ", response.data);
      setPartners(response.data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return (
    <div className="commission-wrapper">
      <div className="commission-card">
        <h2>Commission Management</h2>
        <div className="partner-list">
          {partners.map((partner) => (
            <div className="partner-item" key={partner._id}>
              <div className="partner-info">
                <span className="partner-name">{partner.name}</span>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="5"
                  value={partner.commission}
                  onChange={(e) =>
                    handleCommissionChange(partner._id, e.target.value)
                  }
                />
                <span className="percent-label">%</span>
              </div>
            </div>
          ))}
        </div>
        <p className="note">* Commission rate must be between 3% and 5%</p>
      </div>
    </div>
  );
};

export default CommissionManager;
