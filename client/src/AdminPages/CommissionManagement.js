import React, { useState, useEffect } from "react";
import "../styles/CommissionManagement.css";
import axios from "axios";

const CommissionManager = () => {
  const [partners, setPartners] = useState([]);
  const [error, setError] = useState(null);
  const apiUrl = "http://localhost:3001/api/Partners";

  const fetchPartners = async () => {
    try {
      const response = await axios.get(apiUrl);
      const data = response.data.map((p) => ({
        ...p,
        commission: parseFloat(p.commission),
      }));
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const updateCommissionBackend = async (partnerId, commission) => {
    try {
      const response = await axios.put(`${apiUrl}/${partnerId}`, {
        commission,
      });
      console.log("Commission updated successfully:", response.data);
      setError(null);
    } catch (error) {
      console.error("Failed to update commission:", error);
      setError("Failed to update commission in backend.");
    }
  };

  const handleCommissionChange = (partnerId, value) => {
    let commission = parseFloat(value);
    if (isNaN(commission)) return;

    // Clamp commission to 3-5 range
    if (commission < 3) commission = 3;
    else if (commission > 5) commission = 5;

    // Update frontend state immediately
    setPartners((prev) =>
      prev.map((p) =>
        p._id === partnerId ? { ...p, commission: parseFloat(commission.toFixed(1)) } : p
      )
    );

    // Update backend with the clamped value
    updateCommissionBackend(partnerId, commission);
  };

  const incrementCommission = (partner) => {
    if (partner.commission < 5) {
      handleCommissionChange(partner._id, partner.commission + 0.1);
    }
  };

  const decrementCommission = (partner) => {
    if (partner.commission > 3) {
      handleCommissionChange(partner._id, partner.commission - 0.1);
    }
  };

  return (
    <div className="commission-wrapper">
      <div className="commission-card">
        <h2>Commission Management</h2>
        <div className="partner-list">
          {partners.map((partner) => (
            <div className="partner-item" key={partner._id}>
              <div className="partner-info">
                <span className="partner-name">{partner.name}</span>
                <div className="spinner-wrapper">
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="5"
                    value={partner.commission}
                    onChange={(e) => handleCommissionChange(partner._id, e.target.value)}
                  />
                  <button
                    onClick={() => decrementCommission(partner)}
                    disabled={partner.commission <= 3}
                  >
                    -
                  </button>
                  <button
                    onClick={() => incrementCommission(partner)}
                    disabled={partner.commission >= 5}
                  >
                    +
                  </button>
                </div>
                <span className="percent-label">%</span>
              </div>
            </div>
          ))}
        </div>
        <p className="note">* Commission rate must be between 3% and 5%</p>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default CommissionManager;
